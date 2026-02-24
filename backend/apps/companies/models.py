from django.db import models
from core.models import UUIDModel, TimeStampedModel


class Company(UUIDModel, TimeStampedModel):
    """
    Top-level tenant. Every record in the system belongs to one company.
    """
    class CompanyType(models.TextChoices):
        SME = "sme", "Small & Medium Enterprise"
        NGO = "ngo", "NGO"
        ACCOUNTING_FIRM = "accounting", "Accounting Firm"
        HR_CONSULTANCY = "hr_consultancy", "HR Consultancy"
        OTHER = "other", "Other"

    class SubscriptionPlan(models.TextChoices):
        FREE = "free", "Free (up to 10 employees)"
        STARTER = "starter", "Starter (up to 50)"
        PROFESSIONAL = "professional", "Professional (up to 200)"
        ENTERPRISE = "enterprise", "Enterprise (unlimited)"

    # Basic info
    name = models.CharField(max_length=200)
    company_type = models.CharField(max_length=20, choices=CompanyType.choices, default=CompanyType.SME)
    registration_number = models.CharField(max_length=50, blank=True)
    tin_number = models.CharField(max_length=50, blank=True, help_text="RRA Tax Identification Number")
    rssb_number = models.CharField(max_length=50, blank=True, help_text="RSSB employer number")
    incorporation_date = models.DateField(null=True, blank=True)

    # Contact
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    district = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, default="Rwanda")

    # Branding
    logo = models.ImageField(upload_to="company_logos/", null=True, blank=True)
    primary_color = models.CharField(max_length=7, default="#1a56db")   # hex color

    # Subscription
    subscription_plan = models.CharField(
        max_length=20, choices=SubscriptionPlan.choices, default=SubscriptionPlan.FREE
    )
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "companies"
        verbose_name_plural = "companies"
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def employee_limit(self):
        limits = {"free": 10, "starter": 50, "professional": 200, "enterprise": 99999}
        return limits.get(self.subscription_plan, 10)
