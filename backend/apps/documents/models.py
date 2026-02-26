from django.db import models
from django.utils import timezone

from core.models import TenantModel


def document_upload_path(instance, filename):
    return f"documents/{instance.company_id}/{instance.document_type}/{filename}"


class Document(TenantModel):
    class DocumentType(models.TextChoices):
        # Employment
        EMPLOYMENT_CONTRACT = "employment_contract", "Employment Contract"
        AMENDMENT = "contract_amendment", "Contract Amendment"
        NDA = "nda", "Non-Disclosure Agreement"
        # Tax & Statutory
        RRA_FILING = "rra_filing", "RRA Tax Filing"
        RSSB_DECLARATION = "rssb_declaration", "RSSB Declaration"
        PAYE_RETURN = "paye_return", "PAYE Return"
        VAT_RETURN = "vat_return", "VAT Return"
        # HR
        PAYSLIP = "payslip", "Payslip"
        WARNING_LETTER = "warning_letter", "Warning Letter"
        LEAVE_FORM = "leave_form", "Leave Form"
        TERMINATION_LETTER = "termination_letter", "Termination Letter"
        # Compliance
        BUSINESS_REGISTRATION = "business_registration", "Business Registration"
        TAX_CLEARANCE = "tax_clearance", "Tax Clearance Certificate"
        AUDIT_REPORT = "audit_report", "Audit Report"
        # Other
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending Review"
        ACTIVE = "active", "Active"
        EXPIRED = "expired", "Expired"
        ARCHIVED = "archived", "Archived"

    # Relations
    employee = models.ForeignKey(
        "employees.Employee", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="documents",
    )
    uploaded_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, related_name="uploaded_documents",
    )

    # File info
    title = models.CharField(max_length=200)
    document_type = models.CharField(max_length=50, choices=DocumentType.choices)
    file = models.FileField(upload_to=document_upload_path)
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    mime_type = models.CharField(max_length=100)
    is_encrypted = models.BooleanField(default=True)
    checksum = models.CharField(max_length=64, blank=True, help_text="SHA-256 of encrypted file")

    # Metadata
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    expiry_date = models.DateField(null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)
    reference_number = models.CharField(max_length=100, blank=True)

    # OCR extracted content
    extracted_text = models.TextField(blank=True)
    ocr_processed = models.BooleanField(default=False)

    # Period (for tax filings)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "documents"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "document_type"]),
            models.Index(fields=["company", "status"]),
            models.Index(fields=["expiry_date"]),
            models.Index(fields=["employee", "document_type"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.document_type})"

    @property
    def is_expired(self):
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False

    @property
    def days_until_expiry(self):
        if self.expiry_date:
            delta = self.expiry_date - timezone.now().date()
            return delta.days
        return None
