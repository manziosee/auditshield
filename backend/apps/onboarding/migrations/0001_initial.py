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
            name="OnboardingTemplate",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("name", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("is_default", models.BooleanField(default=False)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="onboarding_onboardingtemplate_set", to="companies.company")),
                ("department", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="employees.department")),
            ],
            options={"db_table": "onboarding_templates"},
        ),
        migrations.CreateModel(
            name="OnboardingTask",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("task_type", models.CharField(choices=[("document","Upload Document"),("form","Complete Form"),("training","Complete Training"),("sign","Sign Document"),("other","Other")], default="other", max_length=20)),
                ("is_required", models.BooleanField(default=True)),
                ("due_days", models.PositiveSmallIntegerField(default=7)),
                ("order", models.PositiveSmallIntegerField(default=0)),
                ("template", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tasks", to="onboarding.onboardingtemplate")),
            ],
            options={"db_table": "onboarding_tasks", "ordering": ["order"]},
        ),
        migrations.CreateModel(
            name="EmployeeOnboarding",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("start_date", models.DateField()),
                ("status", models.CharField(choices=[("not_started","Not Started"),("in_progress","In Progress"),("completed","Completed")], default="not_started", max_length=20)),
                ("completion_percent", models.PositiveSmallIntegerField(default=0)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="onboarding_employeeonboarding_set", to="companies.company")),
                ("employee", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="onboardings", to="employees.employee")),
                ("template", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="onboarding.onboardingtemplate")),
            ],
            options={"db_table": "onboarding_employee_onboardings"},
        ),
        migrations.CreateModel(
            name="OnboardingTaskCompletion",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("completed", models.BooleanField(default=False)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("completed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ("onboarding", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="task_completions", to="onboarding.employeeonboarding")),
                ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="onboarding.onboardingtask")),
            ],
            options={"db_table": "onboarding_task_completions", "unique_together": {("onboarding", "task")}},
        ),
    ]
