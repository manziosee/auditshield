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
            name="FormTemplate",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("category", models.CharField(blank=True, max_length=100)),
                ("is_active", models.BooleanField(default=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="custom_forms_formtemplate_set", to="companies.company")),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={"db_table": "forms_templates"},
        ),
        migrations.CreateModel(
            name="FormField",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("label", models.CharField(max_length=200)),
                ("field_type", models.CharField(choices=[("text","Text"),("textarea","Text Area"),("number","Number"),("date","Date"),("select","Select"),("checkbox","Checkbox"),("radio","Radio"),("file","File Upload"),("signature","Signature")], max_length=20)),
                ("is_required", models.BooleanField(default=False)),
                ("options", models.JSONField(blank=True, default=list)),
                ("order", models.PositiveSmallIntegerField(default=0)),
                ("placeholder", models.CharField(blank=True, max_length=200)),
                ("help_text", models.CharField(blank=True, max_length=300)),
                ("template", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="fields", to="forms.formtemplate")),
            ],
            options={"db_table": "forms_fields", "ordering": ["order"]},
        ),
        migrations.CreateModel(
            name="FormSubmission",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("data", models.JSONField(default=dict)),
                ("submitted_at", models.DateTimeField(auto_now_add=True)),
                ("status", models.CharField(choices=[("draft","Draft"),("submitted","Submitted"),("reviewed","Reviewed")], default="submitted", max_length=20)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="forms_formsubmission_set", to="companies.company")),
                ("employee", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="employees.employee")),
                ("submitted_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ("template", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="submissions", to="forms.formtemplate")),
            ],
            options={"db_table": "forms_submissions"},
        ),
    ]
