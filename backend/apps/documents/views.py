import hashlib
import io
from datetime import timedelta

from django.http import HttpResponse
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from core.utils.encryption import decrypt_file, encrypt_file
from core.utils.validators import validate_upload

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer
from .tasks import process_document_ocr


@extend_schema_view(
    list=extend_schema(
        tags=["documents"],
        summary="List documents",
        description=(
            "Returns a paginated list of documents in the company's encrypted vault.\n\n"
            "Files are stored **Fernet AES-128 encrypted** at rest.\n\n"
            "**Filters**: `document_type`, `status`, `employee` (UUID)\n"
            "**Search**: `title`, `reference_number`, `file_name`"
        ),
        parameters=[
            OpenApiParameter("document_type", OpenApiTypes.STR, description="employment_contract, rra_filing, payslip, rssb_declaration, etc."),
            OpenApiParameter("status", OpenApiTypes.STR, description="pending | active | expired | archived"),
            OpenApiParameter("employee", OpenApiTypes.UUID, description="Filter by employee UUID"),
            OpenApiParameter("expiring_soon", OpenApiTypes.BOOL, description="Only documents expiring within 30 days"),
        ],
    ),
    create=extend_schema(
        tags=["documents"],
        summary="Upload a document",
        description=(
            "Upload a file to the encrypted vault.\n\n"
            "The file is validated (MIME type + max 50 MB), Fernet-encrypted, "
            "SHA-256 checksummed, and queued for async OCR.\n\n"
            "**Accepted types**: PDF, JPEG, PNG, TIFF, XLSX, XLS, CSV"
        ),
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "file": {"type": "string", "format": "binary"},
                    "title": {"type": "string"},
                    "document_type": {"type": "string"},
                    "employee": {"type": "string", "format": "uuid"},
                    "expiry_date": {"type": "string", "format": "date"},
                    "reference_number": {"type": "string"},
                    "description": {"type": "string"},
                },
                "required": ["file", "title", "document_type"],
            }
        },
        responses={
            201: OpenApiResponse(description="Document uploaded and queued for OCR"),
            400: OpenApiResponse(description="Invalid file type, size exceeded, or validation error"),
        },
    ),
    retrieve=extend_schema(
        tags=["documents"],
        summary="Get document metadata",
        description="Returns document metadata only. Use `/download/` to get the actual file.",
    ),
    update=extend_schema(tags=["documents"], summary="Update document metadata"),
    partial_update=extend_schema(tags=["documents"], summary="Partially update document metadata"),
    destroy=extend_schema(
        tags=["documents"],
        summary="Delete document",
        description="Permanently deletes the document and its encrypted file.",
    ),
)
class DocumentViewSet(ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["document_type", "status", "employee"]
    search_fields = ["title", "reference_number", "file_name"]
    ordering_fields = ["created_at", "expiry_date", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Document.objects.filter(
            company=self.request.user.company
        ).select_related("employee", "uploaded_by")

        # Custom filter: expiring within 30 days
        if self.request.query_params.get("expiring_soon") in ("true", "1", "True"):
            cutoff = timezone.now().date() + timedelta(days=30)
            qs = qs.filter(expiry_date__lte=cutoff, expiry_date__isnull=False, status="active")

        return qs

    def list(self, request, *args, **kwargs):
        """Override list to inject aggregate stats into the paginated response."""
        response = super().list(request, *args, **kwargs)

        company = request.user.company
        today = timezone.now().date()
        cutoff_30 = today + timedelta(days=30)

        base_qs = Document.objects.filter(company=company)
        expired_count = base_qs.filter(status="expired").count()
        expiring_soon = base_qs.filter(
            expiry_date__lte=cutoff_30,
            expiry_date__isnull=False,
            status="active",
        ).count()

        response.data["expired_count"] = expired_count
        response.data["expiring_soon"] = expiring_soon
        return response

    def perform_create(self, serializer):
        request = self.request
        file = request.FILES.get("file")

        validate_upload(file)

        # Encrypt and compute checksum
        raw = file.read()
        encrypted = encrypt_file(raw)
        checksum = hashlib.sha256(encrypted).hexdigest()

        # Overwrite file content with encrypted bytes
        from django.core.files.uploadedfile import InMemoryUploadedFile
        encrypted_file = InMemoryUploadedFile(
            io.BytesIO(encrypted), "file", file.name, file.content_type, len(encrypted), None
        )

        doc = serializer.save(
            company=request.user.company,
            uploaded_by=request.user,
            file=encrypted_file,
            file_name=file.name,
            file_size=file.size,
            mime_type=file.content_type,
            is_encrypted=True,
            checksum=checksum,
        )

        # Trigger async OCR
        process_document_ocr.delay(str(doc.id))

    @extend_schema(
        tags=["documents"],
        summary="Download (decrypt) a document",
        description=(
            "Decrypts the stored file in-memory and streams it to the authenticated user. "
            "The decrypted content is never written to disk."
        ),
        responses={
            200: OpenApiResponse(description="Binary file stream with Content-Disposition: attachment"),
            404: OpenApiResponse(description="Document not found"),
        },
    )
    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Decrypt and stream file to authorized user."""
        doc = self.get_object()
        encrypted = doc.file.read()
        decrypted = decrypt_file(encrypted) if doc.is_encrypted else encrypted

        response = HttpResponse(decrypted, content_type=doc.mime_type)
        response["Content-Disposition"] = f'attachment; filename="{doc.file_name}"'
        return response

    @extend_schema(
        tags=["documents"],
        summary="Get OCR-extracted text",
        description=(
            "Returns the text extracted from the document by the async OCR pipeline "
            "(Tesseract + PyMuPDF). "
            "Check `ocr_processed` to know if extraction is complete."
        ),
        responses={
            200: OpenApiResponse(description="Extracted text and OCR status flag"),
        },
    )
    @action(detail=True, methods=["get"])
    def preview_text(self, request, pk=None):
        """Return extracted text (for search / quick view)."""
        doc = self.get_object()
        return Response({"extracted_text": doc.extracted_text, "ocr_processed": doc.ocr_processed})
