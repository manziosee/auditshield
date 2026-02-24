"""
Compliance tracking — checklists for RRA/RSSB requirements.
"""
from django.db import models
from core.models import TenantModel


class ComplianceCategory(models.Model):
    """E.g. 'RRA Tax', 'RSSB', 'Labor Law', 'Business Registration'"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    authority = models.CharField(max_length=100, blank=True, help_text="e.g. RRA, RSSB, RDB")
    icon = models.CharField(max_length=50, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "compliance categories"

    def __str__(self):
        return self.name


class ComplianceRequirement(models.Model):
    """A specific compliance item every company needs to fulfill."""
    class Frequency(models.TextChoices):
        ONE_TIME = "one_time", "One-Time"
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        ANNUALLY = "annually", "Annually"
        AS_NEEDED = "as_needed", "As Needed"

    category = models.ForeignKey(ComplianceCategory, on_delete=models.CASCADE, related_name="requirements")
    title = models.CharField(max_length=200)
    description = models.TextField()
    frequency = models.CharField(max_length=20, choices=Frequency.choices)
    deadline_day = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Day of month deadline (e.g. 15 for 15th)")
    is_mandatory = models.BooleanField(default=True)
    document_types_required = models.JSONField(default=list, help_text="List of document type codes needed")
    penalty_description = models.TextField(blank=True)

    def __str__(self):
        return self.title


class ComplianceRecord(TenantModel):
    """Tracks whether a company has fulfilled a requirement in a given period."""
    class ComplianceStatus(models.TextChoices):
        COMPLIANT = "compliant", "Compliant"
        OVERDUE = "overdue", "Overdue"
        PENDING = "pending", "Pending"
        EXEMPT = "exempt", "Exempt"
        NA = "not_applicable", "Not Applicable"

    requirement = models.ForeignKey(ComplianceRequirement, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=ComplianceStatus.choices, default=ComplianceStatus.PENDING)
    period_start = models.DateField()
    period_end = models.DateField()
    due_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    evidence_documents = models.ManyToManyField("documents.Document", blank=True)
    completed_by = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = "compliance_records"
        unique_together = ["company", "requirement", "period_start"]
        ordering = ["due_date"]

    def __str__(self):
        return f"{self.company} — {self.requirement} ({self.period_start})"

    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.due_date < timezone.now().date() and self.status == self.ComplianceStatus.PENDING
