import uuid
from django.db import models
from core.models import TenantModel


class Vendor(TenantModel):
    class VendorType(models.TextChoices):
        CONTRACTOR = "contractor", "Contractor"
        SUPPLIER = "supplier", "Supplier"
        CONSULTANT = "consultant", "Consultant"
        SERVICE_PROVIDER = "service_provider", "Service Provider"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        SUSPENDED = "suspended", "Suspended"

    name = models.CharField(max_length=200)
    vendor_type = models.CharField(max_length=25, choices=VendorType.choices)
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    tax_identifier = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    compliance_score = models.PositiveSmallIntegerField(default=100)
    country = models.ForeignKey("geography.Country", null=True, blank=True, on_delete=models.SET_NULL)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "vendors_vendors"
        ordering = ["name"]

    def __str__(self):
        return self.name


class VendorDocument(TenantModel):
    class DocType(models.TextChoices):
        INSURANCE = "insurance", "Insurance Certificate"
        LICENSE = "license", "Business License"
        CONTRACT = "contract", "Contract"
        CERTIFICATION = "certification", "Certification"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        VALID = "valid", "Valid"
        EXPIRED = "expired", "Expired"
        EXPIRING_SOON = "expiring_soon", "Expiring Soon"
        MISSING = "missing", "Missing"

    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE, related_name="vendor_documents")
    document_type = models.CharField(max_length=20, choices=DocType.choices)
    title = models.CharField(max_length=200)
    document = models.ForeignKey("documents.Document", null=True, blank=True, on_delete=models.SET_NULL)
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VALID)

    class Meta:
        db_table = "vendors_documents"
        ordering = ["-created_at"]
