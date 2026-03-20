import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("companies", "0003_company_industry_company_fiscal_year_start"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.CreateModel(
            name="ApprovalWorkflow",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("name", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                ("workflow_type", models.CharField(choices=[("document","Document"),("compliance","Compliance Record"),("onboarding","Onboarding")], max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="approvals_approvalworkflow_set", to="companies.company")),
            ],
            options={"db_table": "approvals_workflows"},
        ),
        migrations.CreateModel(
            name="ApprovalStep",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("order", models.PositiveSmallIntegerField()),
                ("approver_role", models.CharField(choices=[("hr","HR"),("admin","Admin"),("manager","Manager")], max_length=20)),
                ("label", models.CharField(max_length=100)),
                ("workflow", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="steps", to="approvals.approvalworkflow")),
            ],
            options={"db_table": "approvals_steps", "ordering": ["order"]},
        ),
        migrations.CreateModel(
            name="ApprovalRequest",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("title", models.CharField(max_length=200)),
                ("object_type", models.CharField(max_length=50)),
                ("object_id", models.UUIDField()),
                ("status", models.CharField(choices=[("pending","Pending"),("approved","Approved"),("rejected","Rejected"),("cancelled","Cancelled")], default="pending", max_length=20)),
                ("current_step", models.PositiveSmallIntegerField(default=1)),
                ("company", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="approvals_approvalrequest_set", to="companies.company")),
                ("requested_by", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="approval_requests", to=settings.AUTH_USER_MODEL)),
                ("workflow", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="approvals.approvalworkflow")),
            ],
            options={"db_table": "approvals_requests"},
        ),
        migrations.CreateModel(
            name="ApprovalDecision",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ("decision", models.CharField(choices=[("approved","Approved"),("rejected","Rejected")], max_length=20)),
                ("comments", models.TextField(blank=True)),
                ("decided_at", models.DateTimeField(auto_now_add=True)),
                ("approver", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ("request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="decisions", to="approvals.approvalrequest")),
                ("step", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="approvals.approvalstep")),
            ],
            options={"db_table": "approvals_decisions"},
        ),
    ]
