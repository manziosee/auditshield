"""
Webhook endpoints — allows companies to subscribe to platform events
and receive signed HTTP POST notifications.
"""
from django.db import models

from core.models import TenantModel


class WebhookEndpoint(TenantModel):
    """
    A company-configured HTTPS endpoint that receives platform events.

    Events are delivered as JSON payloads signed with HMAC-SHA256 using
    the endpoint's secret. Verify the X-AuditShield-Signature header.
    """
    url = models.URLField(max_length=500, help_text="HTTPS URL to deliver events to")
    secret = models.CharField(
        max_length=200,
        help_text="HMAC secret for payload signing. Treat like a password.",
    )
    # e.g. ["compliance.record.updated", "document.uploaded", "payroll.run.approved"]
    events = models.JSONField(
        default=list,
        help_text="List of event types to subscribe to. Empty = all events.",
    )
    description = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "webhook_endpoints"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.company.name} → {self.url}"
