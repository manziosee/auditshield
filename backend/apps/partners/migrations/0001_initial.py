import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("companies", "0003_company_industry_company_fiscal_year_start"),
    ]
    operations = [
        migrations.CreateModel(
            name="Partner",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("name", models.CharField(max_length=200)),
                ("slug", models.SlugField(unique=True)),
                ("contact_email", models.EmailField()),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"db_table": "partners_partners"},
        ),
        migrations.CreateModel(
            name="PartnerBranding",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("logo_url", models.URLField(blank=True)),
                ("primary_color", models.CharField(default="#22c55e", max_length=7)),
                ("secondary_color", models.CharField(default="#0a0a0a", max_length=7)),
                ("platform_name", models.CharField(default="AuditShield", max_length=100)),
                ("support_email", models.EmailField(blank=True)),
                ("custom_domain", models.CharField(blank=True, max_length=200)),
                ("partner", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="branding", to="partners.partner")),
            ],
            options={"db_table": "partners_branding"},
        ),
        migrations.CreateModel(
            name="PartnerCompany",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("added_at", models.DateTimeField(auto_now_add=True)),
                ("company", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="partner_link", to="companies.company")),
                ("partner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="partner_companies", to="partners.partner")),
            ],
            options={"db_table": "partners_company_links"},
        ),
    ]
