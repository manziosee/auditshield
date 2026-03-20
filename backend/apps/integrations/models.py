from django.db import models
from core.models import TenantModel


class Integration(TenantModel):
    class IntegrationType(models.TextChoices):
        QUICKBOOKS = "quickbooks", "QuickBooks"
        BAMBOOHR = "bamboohr", "BambooHR"
        XERO = "xero", "Xero"
        GOOGLE_WORKSPACE = "google_workspace", "Google Workspace"
        SLACK = "slack", "Slack"

    class SyncStatus(models.TextChoices):
        IDLE = "idle", "Idle"
        SYNCING = "syncing", "Syncing"
        ERROR = "error", "Error"
        SUCCESS = "success", "Success"

    integration_type = models.CharField(max_length=25, choices=IntegrationType.choices)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=False)
    config = models.JSONField(default=dict)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(max_length=10, choices=SyncStatus.choices, default=SyncStatus.IDLE)
    error_message = models.TextField(blank=True)

    class Meta:
        db_table = "integrations_integrations"
        unique_together = ["company", "integration_type"]
        ordering = ["integration_type"]

    def __str__(self):
        return f"{self.company.name} — {self.get_integration_type_display()}"
