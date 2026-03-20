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
            name="Incident",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("incident_type", models.CharField(choices=[("violation","Compliance Violation"),("near_miss","Near Miss"),("breach","Data Breach"),("safety","Safety Incident"),("other","Other")], max_length=20)),
                ("severity", models.CharField(choices=[("low","Low"),("medium","Medium"),("high","High"),("critical","Critical")], default="medium", max_length=20)),
                ("status", models.CharField(choices=[("open","Open"),("investigating","Investigating"),("resolved","Resolved"),("closed","Closed")], default="open", max_length=20)),
                ("incident_date", models.DateField()),
                ("corrective_action", models.TextField(blank=True)),
                ("resolved_at", models.DateTimeField(blank=True, null=True)),
                ("assigned_to", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assigned_incidents", to=settings.AUTH_USER_MODEL)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="incidents_incident_set", to="companies.company")),
                ("reported_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reported_incidents", to=settings.AUTH_USER_MODEL)),
                ("employees_involved", models.ManyToManyField(blank=True, to="employees.employee")),
            ],
            options={"db_table": "incidents_incidents"},
        ),
        migrations.CreateModel(
            name="IncidentUpdate",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("content", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("author", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ("incident", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="updates", to="incidents.incident")),
            ],
            options={"db_table": "incidents_updates"},
        ),
    ]
