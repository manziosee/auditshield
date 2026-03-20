import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("companies", "0003_company_industry_company_fiscal_year_start"),
        ("documents", "0001_initial"),
        ("geography", "0001_initial"),
    ]
    operations = [
        migrations.CreateModel(
            name="Vendor",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("name", models.CharField(max_length=200)),
                ("vendor_type", models.CharField(choices=[("contractor","Contractor"),("supplier","Supplier"),("consultant","Consultant"),("service_provider","Service Provider")], max_length=25)),
                ("contact_name", models.CharField(blank=True, max_length=200)),
                ("contact_email", models.EmailField(blank=True)),
                ("contact_phone", models.CharField(blank=True, max_length=30)),
                ("tax_identifier", models.CharField(blank=True, max_length=100)),
                ("status", models.CharField(choices=[("active","Active"),("inactive","Inactive"),("suspended","Suspended")], default="active", max_length=20)),
                ("compliance_score", models.PositiveSmallIntegerField(default=100)),
                ("notes", models.TextField(blank=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="vendors_vendor_set", to="companies.company")),
                ("country", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="geography.country")),
            ],
            options={"db_table": "vendors_vendors"},
        ),
        migrations.CreateModel(
            name="VendorDocument",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("document_type", models.CharField(choices=[("insurance","Insurance Certificate"),("license","Business License"),("contract","Contract"),("certification","Certification"),("other","Other")], max_length=20)),
                ("title", models.CharField(max_length=200)),
                ("expiry_date", models.DateField(blank=True, null=True)),
                ("status", models.CharField(choices=[("valid","Valid"),("expired","Expired"),("expiring_soon","Expiring Soon"),("missing","Missing")], default="valid", max_length=20)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="vendors_vendordocument_set", to="companies.company")),
                ("document", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="documents.document")),
                ("vendor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="vendor_documents", to="vendors.vendor")),
            ],
            options={"db_table": "vendors_documents"},
        ),
    ]
