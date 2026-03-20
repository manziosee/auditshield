import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("companies", "0003_company_industry_company_fiscal_year_start"),
        ("employees", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name="Policy",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("title", models.CharField(max_length=200)),
                ("content", models.TextField()),
                ("version", models.PositiveSmallIntegerField(default=1)),
                ("status", models.CharField(choices=[("draft","Draft"),("active","Active"),("archived","Archived")], default="draft", max_length=20)),
                ("effective_date", models.DateField(blank=True, null=True)),
                ("category", models.CharField(blank=True, max_length=100)),
                ("requires_acknowledgment", models.BooleanField(default=True)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="policies_policy_set", to="companies.company")),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "policies_policies"},
        ),
        migrations.CreateModel(
            name="PolicyAcknowledgment",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("acknowledged_at", models.DateTimeField(auto_now_add=True)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="policies_policyacknowledgment_set", to="companies.company")),
                ("employee", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="employees.employee")),
                ("policy", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="acknowledgments", to="policies.policy")),
            ],
            options={"db_table": "policies_acknowledgments", "unique_together": {("policy", "employee")}},
        ),
    ]
