import uuid
from django.db import models


class Partner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    contact_email = models.EmailField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "partners_partners"
        ordering = ["name"]

    def __str__(self):
        return self.name


class PartnerBranding(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.OneToOneField(Partner, on_delete=models.CASCADE, related_name="branding")
    logo_url = models.URLField(blank=True)
    primary_color = models.CharField(max_length=7, default="#22c55e")
    secondary_color = models.CharField(max_length=7, default="#0a0a0a")
    platform_name = models.CharField(max_length=100, default="AuditShield")
    support_email = models.EmailField(blank=True)
    custom_domain = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = "partners_branding"


class PartnerCompany(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.ForeignKey(Partner, on_delete=models.CASCADE, related_name="partner_companies")
    company = models.OneToOneField("companies.Company", on_delete=models.CASCADE, related_name="partner_link")
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "partners_company_links"
