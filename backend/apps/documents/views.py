import hashlib
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.http import HttpResponse

from core.utils.encryption import encrypt_file, decrypt_file
from core.utils.validators import validate_upload
from .models import Document
from .tasks import process_document_ocr
from .serializers import DocumentSerializer, DocumentUploadSerializer


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
        import io
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

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        """Decrypt and stream file to authorized user."""
        doc = self.get_object()
        encrypted = doc.file.read()
        decrypted = decrypt_file(encrypted) if doc.is_encrypted else encrypted

        response = HttpResponse(decrypted, content_type=doc.mime_type)
        response["Content-Disposition"] = f'attachment; filename="{doc.file_name}"'
        return response

    @action(detail=True, methods=["get"])
    def preview_text(self, request, pk=None):
        """Return extracted text (for search / quick view)."""
        doc = self.get_object()
        return Response({"extracted_text": doc.extracted_text, "ocr_processed": doc.ocr_processed})
