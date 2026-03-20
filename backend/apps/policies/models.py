import uuid
from django.conf import settings
from django.db import models
from core.models import TenantModel


class Policy(TenantModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=200)
    content = models.TextField()
    version = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    effective_date = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=100, blank=True)
    requires_acknowledgment = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "policies_policies"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} v{self.version}"


class PolicyAcknowledgment(TenantModel):
    policy = models.ForeignKey(Policy, on_delete=models.CASCADE, related_name="acknowledgments")
    employee = models.ForeignKey("employees.Employee", on_delete=models.CASCADE)
    acknowledged_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = "policies_acknowledgments"
        unique_together = ["policy", "employee"]

    def __str__(self):
        return f"{self.employee} ack {self.policy.title}"
