import uuid
from django.db import models
from core.models import TenantModel


class CertificationType(TenantModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    validity_months = models.PositiveSmallIntegerField(default=12)
    is_mandatory = models.BooleanField(default=False)
    reminder_days = models.PositiveSmallIntegerField(default=30)

    class Meta:
        db_table = "training_certification_types"
        ordering = ["name"]

    def __str__(self):
        return self.name


class EmployeeCertification(TenantModel):
    class Status(models.TextChoices):
        VALID = "valid", "Valid"
        EXPIRED = "expired", "Expired"
        EXPIRING_SOON = "expiring_soon", "Expiring Soon"
        MISSING = "missing", "Missing"

    employee = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="certifications")
    certification_type = models.ForeignKey(CertificationType, on_delete=models.CASCADE)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    certificate_number = models.CharField(max_length=100, blank=True)
    issuing_body = models.CharField(max_length=200, blank=True)
    document = models.ForeignKey("documents.Document", null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.VALID)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "training_employee_certifications"
        ordering = ["-issue_date"]

    def __str__(self):
        return f"{self.employee} — {self.certification_type.name}"
