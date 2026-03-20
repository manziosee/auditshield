import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("companies", "0003_company_industry_company_fiscal_year_start"),
        ("documents", "0001_initial"),
        ("employees", "0001_initial"),
    ]
    operations = [
        migrations.CreateModel(
            name="CertificationType",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("name", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("validity_months", models.PositiveSmallIntegerField(default=12)),
                ("is_mandatory", models.BooleanField(default=False)),
                ("reminder_days", models.PositiveSmallIntegerField(default=30)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="training_certificationtype_set", to="companies.company")),
            ],
            options={"db_table": "training_certification_types"},
        ),
        migrations.CreateModel(
            name="EmployeeCertification",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("issue_date", models.DateField()),
                ("expiry_date", models.DateField(blank=True, null=True)),
                ("certificate_number", models.CharField(blank=True, max_length=100)),
                ("issuing_body", models.CharField(blank=True, max_length=200)),
                ("status", models.CharField(choices=[("valid","Valid"),("expired","Expired"),("expiring_soon","Expiring Soon"),("missing","Missing")], default="valid", max_length=20)),
                ("notes", models.TextField(blank=True)),
                ("certification_type", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="training.certificationtype")),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="training_employeecertification_set", to="companies.company")),
                ("document", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="documents.document")),
                ("employee", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="certifications", to="employees.employee")),
            ],
            options={"db_table": "training_employee_certifications"},
        ),
    ]
