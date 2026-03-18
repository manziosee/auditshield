import uuid

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("companies", "0003_company_industry_company_fiscal_year_start"),
    ]

    operations = [
        migrations.CreateModel(
            name="WebhookEndpoint",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(app_label)s_%(class)s_set",
                        to="companies.company",
                    ),
                ),
                ("url", models.URLField(help_text="HTTPS URL to deliver events to", max_length=500)),
                (
                    "secret",
                    models.CharField(
                        help_text="HMAC secret for payload signing. Treat like a password.",
                        max_length=200,
                    ),
                ),
                (
                    "events",
                    models.JSONField(
                        default=list,
                        help_text="List of event types to subscribe to. Empty = all events.",
                    ),
                ),
                ("description", models.CharField(blank=True, max_length=200)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "db_table": "webhook_endpoints",
                "ordering": ["-created_at"],
            },
        ),
    ]
