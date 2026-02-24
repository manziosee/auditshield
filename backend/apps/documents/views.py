import hashlib
import io
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.http import HttpResponse
from drf_spectacular.utils import (
    extend_schema, extend_schema_view, OpenApiResponse, OpenApiParameter,
)
from drf_spectacular.types import OpenApiTypes

from core.utils.encryption import encrypt_file, decrypt_file
from core.utils.validators import validate_upload
from .models import Document
from .tasks import process_document_ocr
from .serializers import DocumentSerializer, DocumentUploadSerializer


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

    def get_queryset(self):
        return Document.objects.filter(company=self.request.user.company).select_related("employee", "uploaded_by")

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
