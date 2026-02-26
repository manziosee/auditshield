from django.db import models

from core.models import TimeStampedModel, UUIDModel


class Company(UUIDModel, TimeStampedModel):
    """
    Top-level tenant. Every record in the system belongs to one company.
    Country-agnostic: all locale config (currency, timezone, tax rules)
    flows from the linked Country.
    """
    class CompanyType(models.TextChoices):
        SME = "sme", "Small & Medium Enterprise"
        NGO = "ngo", "NGO / Non-Profit"
        ACCOUNTING_FIRM = "accounting", "Accounting Firm"
        HR_CONSULTANCY = "hr_consultancy", "HR Consultancy"
        HEALTHCARE = "healthcare", "Healthcare"
        CONSTRUCTION = "construction", "Construction"
        TECHNOLOGY = "technology", "Technology"
        MANUFACTURING = "manufacturing", "Manufacturing"
        OTHER = "other", "Other"

    class SubscriptionPlan(models.TextChoices):
        FREE = "free", "Free (up to 10 employees)"
        STARTER = "starter", "Starter (up to 50)"
        PROFESSIONAL = "professional", "Professional (up to 200)"
        ENTERPRISE = "enterprise", "Enterprise (unlimited)"

    # Basic info
    name = models.CharField(max_length=200)
    company_type = models.CharField(max_length=20, choices=CompanyType.choices, default=CompanyType.SME)
    registration_number = models.CharField(
        max_length=50, blank=True,
        help_text="Company/business registration number issued by your national registry",
    )
    tax_identifier = models.CharField(
        max_length=50, blank=True,
        help_text="Tax Identification Number (TIN/EIN/UTR) issued by your national tax authority",
    )
    social_security_identifier = models.CharField(
        max_length=50, blank=True,
        help_text="Employer registration number for your national social security authority",
    )
    incorporation_date = models.DateField(null=True, blank=True)

    # Geography
    country = models.ForeignKey(
        "geography.Country",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="companies",
    )
    currency = models.ForeignKey(
        "geography.Currency",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="companies",
        help_text="Operating currency (defaults to country default if blank)",
    )
    timezone = models.CharField(
        max_length=60, blank=True,
        help_text="IANA timezone (e.g. America/New_York). Defaults to country timezone.",
    )

    # Contact
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state_province = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)

    # Branding
    logo = models.ImageField(upload_to="company_logos/", null=True, blank=True)
    primary_color = models.CharField(max_length=7, default="#1a56db")

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

    @property
    def effective_timezone(self):
        if self.timezone:
            return self.timezone
        if self.country:
            return self.country.default_timezone
        return "UTC"

    @property
    def effective_currency(self):
        if self.currency:
            return self.currency
        if self.country:
            return self.country.default_currency
        return None
