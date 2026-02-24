"""
File upload validators — called from document upload views.
Validates MIME type (via python-magic, not just extension) and size.
"""
import magic
from django.conf import settings
from rest_framework.exceptions import ValidationError


def validate_upload(file) -> None:
    """Validate size and MIME type of an uploaded file."""
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file.size > max_bytes:
        raise ValidationError(
            f"File too large. Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    mime = magic.from_buffer(file.read(2048), mime=True)
    file.seek(0)

    if mime not in settings.ALLOWED_UPLOAD_TYPES:
        raise ValidationError(
            f"Unsupported file type '{mime}'. "
            f"Allowed: PDF, JPEG, PNG, TIFF, XLSX, XLS, CSV."
        )
