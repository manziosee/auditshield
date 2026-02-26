"""
Compliance tracking — country-agnostic authority → requirement → company record.
"""
from django.db import models

from core.models import TenantModel


class Authority(models.Model):
    """
    A regulatory body in a given country.
    Replaces all hardcoded authority strings (e.g. tax authority, social security board).
    Examples: IRS (US), HMRC (UK), KRA (Kenya), SARS (South Africa).
    """
    class AuthorityType(models.TextChoices):
        TAX = "tax", "Tax Authority"
        SOCIAL_SECURITY = "social_security", "Social Security"
        LABOR = "labor", "Labour / Employment"
        CORPORATE = "corporate", "Corporate / Business Registry"
        ENVIRONMENTAL = "environmental", "Environmental"
        FINANCIAL = "financial", "Financial Regulator"
        OTHER = "other", "Other"

    country = models.ForeignKey(
        "geography.Country",
        on_delete=models.CASCADE,
        related_name="authorities",
        null=True,
        blank=True,
        help_text="Leave blank for platform-wide / universal authorities",
    )
    name = models.CharField(max_length=150)
    short_name = models.CharField(max_length=20, blank=True, help_text="e.g. IRS, HMRC, KRA")
    authority_type = models.CharField(max_length=30, choices=AuthorityType.choices)
    website = models.URLField(blank=True)
    api_available = models.BooleanField(default=False)
    api_config = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "compliance_authorities"
        ordering = ["country__name", "name"]
        unique_together = ["country", "short_name"]
        verbose_name_plural = "authorities"

    def __str__(self):
        prefix = self.country.iso_code if self.country else "GLOBAL"
        return f"[{prefix}] {self.short_name or self.name}"


class ComplianceCategory(models.Model):
    """Groups requirements under an authority (e.g. 'Tax Filings', 'Social Security')."""
    authority = models.ForeignKey(
        Authority,
        on_delete=models.CASCADE,
        related_name="categories",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "compliance categories"

    def __str__(self):
        return self.name


class ComplianceRequirement(models.Model):
    """A specific compliance obligation every company in a given scope must fulfil."""
    class Frequency(models.TextChoices):
        ONE_TIME = "one_time", "One-Time"
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        ANNUALLY = "annually", "Annually"
        AS_NEEDED = "as_needed", "As Needed"

    category = models.ForeignKey(
        ComplianceCategory, on_delete=models.CASCADE, related_name="requirements"
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    frequency = models.CharField(max_length=20, choices=Frequency.choices)
    deadline_day = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text="Day of month deadline (e.g. 15 = 15th of each period)",
    )
    is_mandatory = models.BooleanField(default=True)
    document_types_required = models.JSONField(default=list)
    penalty_description = models.TextField(blank=True)
    industry_applicability = models.JSONField(
        default=list, blank=True,
        help_text="Empty = all industries; otherwise list of industry codes",
    )

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
    status = models.CharField(
        max_length=20, choices=ComplianceStatus.choices, default=ComplianceStatus.PENDING
    )
    period_start = models.DateField()
    period_end = models.DateField()
    due_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    evidence_documents = models.ManyToManyField("documents.Document", blank=True)
    completed_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    risk_score = models.PositiveSmallIntegerField(
        default=0, help_text="0-100 risk score; higher = more risk"
    )

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
