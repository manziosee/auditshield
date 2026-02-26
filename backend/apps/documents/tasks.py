"""
Celery tasks for document processing:
- OCR extraction from scanned PDFs / images
- Expiry notifications
"""
import hashlib
import logging

from celery import shared_task

logger = logging.getLogger("auditshield")


@shared_task(name="apps.documents.tasks.process_document_ocr", bind=True, max_retries=3)
def process_document_ocr(self, document_id: str):
    """Extract text from uploaded document using Tesseract / PyMuPDF."""
    from core.utils.encryption import decrypt_file

    from .models import Document

    try:
        doc = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        return

    try:
        raw = doc.file.read()
        decrypted = decrypt_file(raw) if doc.is_encrypted else raw

        mime = doc.mime_type
        text = ""

        if "pdf" in mime:
            import fitz  # PyMuPDF
            pdf = fitz.open(stream=decrypted, filetype="pdf")
            text = "\n".join(page.get_text() for page in pdf)

            # Fallback to OCR if text-layer is empty (scanned PDF)
            if len(text.strip()) < 50:
                import io

                import pytesseract
                from PIL import Image
                for page in pdf:
                    pix = page.get_pixmap(dpi=150)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    text += pytesseract.image_to_string(img)

        elif "image" in mime:
            import io

            import pytesseract
            from PIL import Image
            img = Image.open(io.BytesIO(decrypted))
            text = pytesseract.image_to_string(img)

        doc.extracted_text = text.strip()
        doc.ocr_processed = True
        doc.status = Document.Status.ACTIVE
        doc.save(update_fields=["extracted_text", "ocr_processed", "status"])
        logger.info("OCR completed for document %s — %d chars extracted", document_id, len(text))

    except Exception as exc:
        logger.exception("OCR failed for document %s: %s", document_id, exc)
        raise self.retry(exc=exc, countdown=60)


@shared_task(name="apps.documents.tasks.check_document_expiries")
def check_document_expiries():
    """Mark expired docs and send notifications for docs expiring within 30 days."""
    from django.utils import timezone

    from apps.notifications.tasks import send_expiry_notification

    from .models import Document

    today = timezone.now().date()

    # Mark as expired
    expired = Document.objects.filter(
        expiry_date__lt=today,
        status=Document.Status.ACTIVE,
    )
    expired.update(status=Document.Status.EXPIRED)

    # Warn about docs expiring in 7 or 30 days
    from datetime import timedelta
    for days in (7, 30):
        target_date = today + timedelta(days=days)
        soon = Document.objects.filter(expiry_date=target_date, status=Document.Status.ACTIVE)
        for doc in soon:
            send_expiry_notification.delay(str(doc.id), days)
