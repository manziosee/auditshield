import uuid
from django.conf import settings
from django.db import models
from core.models import TenantModel


class ApprovalWorkflow(TenantModel):
    class WorkflowType(models.TextChoices):
        DOCUMENT = "document", "Document"
        COMPLIANCE = "compliance", "Compliance Record"
        ONBOARDING = "onboarding", "Onboarding"

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    workflow_type = models.CharField(max_length=20, choices=WorkflowType.choices)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "approvals_workflows"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ApprovalStep(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE, related_name="steps")
    order = models.PositiveSmallIntegerField()
    approver_role = models.CharField(
        max_length=20,
        choices=[("hr", "HR"), ("admin", "Admin"), ("manager", "Manager")]
    )
    label = models.CharField(max_length=100)

    class Meta:
        db_table = "approvals_steps"
        ordering = ["order"]

    def __str__(self):
        return f"{self.workflow.name} — Step {self.order}: {self.label}"


class ApprovalRequest(TenantModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    workflow = models.ForeignKey(ApprovalWorkflow, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    object_type = models.CharField(max_length=50)
    object_id = models.UUIDField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="approval_requests"
    )
    current_step = models.PositiveSmallIntegerField(default=1)

    class Meta:
        db_table = "approvals_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ApprovalDecision(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(ApprovalRequest, on_delete=models.CASCADE, related_name="decisions")
    step = models.ForeignKey(ApprovalStep, on_delete=models.CASCADE)
    approver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    decision = models.CharField(max_length=20, choices=[("approved", "Approved"), ("rejected", "Rejected")])
    comments = models.TextField(blank=True)
    decided_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "approvals_decisions"
        ordering = ["decided_at"]
