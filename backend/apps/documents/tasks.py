"""
Celery tasks for document processing:
- OCR extraction from scanned PDFs / images
- AI field extraction from OCR text
- Expiry notifications
"""
import hashlib
import logging
import re

from celery import shared_task

logger = logging.getLogger("auditshield")


def _extract_fields_from_text(text: str) -> dict:
    """
    Lightweight pattern-based field extraction from document OCR text.

    Looks for:
    - Employee name
    - Start / hire date
    - Salary / gross amount
    - Contract end date

    Returns a dict with found values (None if not found).
    """
    result = {
        "name": None,
        "start_date": None,
        "salary": None,
        "contract_end": None,
    }

    # ── Name ─────────────────────────────────────────────────────────────────
    name_pattern = re.compile(
        r"(?:Employee|Full\s+Name|Name|Candidate)[:\s]+([A-Z][a-zA-Z'\-]+(?:\s+[A-Z][a-zA-Z'\-]+){1,4})",
        re.IGNORECASE,
    )
    m = name_pattern.search(text)
    if m:
        result["name"] = m.group(1).strip()

    # ── Start / hire date ─────────────────────────────────────────────────────
    start_pattern = re.compile(
        r"(?:Start\s+Date|Commencement\s+Date|Hire\s+Date|Date\s+of\s+Joining|Effective\s+Date)[:\s]+"
        r"(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}"
        r"|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
        r"\.?\s+\d{1,2},?\s+\d{4})",
        re.IGNORECASE,
    )
    m = start_pattern.search(text)
    if m:
        result["start_date"] = m.group(1).strip()

    # ── Salary / gross ────────────────────────────────────────────────────────
    salary_pattern = re.compile(
        r"(?:Gross\s+Salary|Annual\s+Salary|Monthly\s+Salary|Salary|Base\s+Pay|Gross\s+Pay)[:\s]+"
        r"(?:USD|GBP|EUR|KES|RWF|NGN|ZAR|[$£€])?\s*"
        r"([\d,]+(?:\.\d{1,2})?)",
        re.IGNORECASE,
    )
    m = salary_pattern.search(text)
    if not m:
        # Fallback: currency symbol followed by number
        m = re.search(r"[$£€]\s*([\d,]+(?:\.\d{1,2})?)", text)
    if m:
        raw = m.group(1).replace(",", "")
        try:
            result["salary"] = float(raw)
        except ValueError:
            result["salary"] = m.group(1)

    # ── Contract end date ─────────────────────────────────────────────────────
    end_pattern = re.compile(
        r"(?:End\s+Date|Contract\s+Expiry|Contract\s+Expires?|Termination\s+Date|Expiry\s+Date)[:\s]+"
        r"(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}"
        r"|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
        r"\.?\s+\d{1,2},?\s+\d{4})",
        re.IGNORECASE,
    )
    m = end_pattern.search(text)
    if m:
        result["contract_end"] = m.group(1).strip()

    return result


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

        extracted_text = text.strip()
        doc.extracted_text = extracted_text
        doc.ocr_processed = True
        doc.status = Document.Status.ACTIVE

        # AI field extraction
        try:
            ai_fields = _extract_fields_from_text(extracted_text)
            metadata = doc.metadata or {}
            metadata["ai_extracted"] = ai_fields
            doc.metadata = metadata
        except Exception as extract_exc:
            logger.warning("AI extraction failed for document %s: %s", document_id, extract_exc)

        doc.save(update_fields=["extracted_text", "ocr_processed", "status", "metadata"])
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
