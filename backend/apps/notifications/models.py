from django.db import models
from core.models import TenantModel


class Notification(TenantModel):
    class NotificationType(models.TextChoices):
        DOCUMENT_EXPIRY = "document_expiry", "Document Expiry"
        COMPLIANCE_DUE = "compliance_due", "Compliance Deadline"
        CONTRACT_RENEWAL = "contract_renewal", "Contract Renewal"
        SYSTEM = "system", "System"
        REMINDER = "reminder", "Custom Reminder"

    recipient = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    is_sent_email = models.BooleanField(default=False)
    related_object_id = models.UUIDField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read"])]

    def __str__(self):
        return f"[{self.notification_type}] {self.title}"
