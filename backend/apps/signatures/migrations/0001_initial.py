import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("companies", "0003_company_industry_company_fiscal_year_start"),
        ("documents", "0001_initial"),
        ("employees", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SignatureRequest",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=200)),
                ("message", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("pending","Pending"),("partial","Partial"),("completed","Completed"),("expired","Expired")], default="pending", max_length=20)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="signatures_signaturerequest_set", to="companies.company")),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="created_signature_requests", to=settings.AUTH_USER_MODEL)),
                ("document", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="signature_requests", to="documents.document")),
            ],
            options={"db_table": "signatures_requests", "ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="SignatureRequestSigner",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("role", models.CharField(default="signer", max_length=50)),
                ("order", models.PositiveSmallIntegerField(default=0)),
                ("signed_at", models.DateTimeField(blank=True, null=True)),
                ("signature_data", models.TextField(blank=True)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("status", models.CharField(choices=[("pending","Pending"),("signed","Signed"),("declined","Declined")], default="pending", max_length=20)),
                ("employee", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="employees.employee")),
                ("request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="signers", to="signatures.signaturerequest")),
            ],
            options={"db_table": "signatures_signers", "ordering": ["order"]},
        ),
    ]
