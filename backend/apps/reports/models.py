from django.db import models

from core.models import TenantModel


class Report(TenantModel):
    class ReportType(models.TextChoices):
        AUDIT_READINESS = "audit_readiness", "Audit Readiness Report"
        EMPLOYEE_SUMMARY = "employee_summary", "Employee Summary"
        COMPLIANCE_STATUS = "compliance_status", "Compliance Status"
        PAYROLL_SUMMARY = "payroll_summary", "Payroll Summary"
        DOCUMENT_INVENTORY = "document_inventory", "Document Inventory"
        RRA_FILING_SUMMARY = "rra_filing", "RRA Filing Summary"
        RSSB_FILING_SUMMARY = "rssb_filing", "RSSB Filing Summary"

    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=30, choices=ReportType.choices)
    generated_by = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True)
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    file = models.FileField(upload_to="reports/%Y/%m/", null=True, blank=True)
    parameters = models.JSONField(default=dict)
    is_ready = models.BooleanField(default=False)

    class Meta:
        db_table = "reports"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
