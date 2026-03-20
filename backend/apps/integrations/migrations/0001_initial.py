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
            name="Integration",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("integration_type", models.CharField(choices=[("quickbooks","QuickBooks"),("bamboohr","BambooHR"),("xero","Xero"),("google_workspace","Google Workspace"),("slack","Slack")], max_length=25)),
                ("name", models.CharField(max_length=100)),
                ("is_active", models.BooleanField(default=False)),
                ("config", models.JSONField(default=dict)),
                ("last_sync_at", models.DateTimeField(blank=True, null=True)),
                ("sync_status", models.CharField(choices=[("idle","Idle"),("syncing","Syncing"),("error","Error"),("success","Success")], default="idle", max_length=10)),
                ("error_message", models.TextField(blank=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="integrations_integration_set", to="companies.company")),
            ],
            options={"db_table": "integrations_integrations", "unique_together": {("company", "integration_type")}},
        ),
    ]
