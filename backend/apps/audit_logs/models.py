from django.db import models
from core.models import UUIDModel, TimeStampedModel


class AuditLog(UUIDModel, TimeStampedModel):
    """
    Immutable record of every mutating action in the system.
    Never update or delete these — they are the compliance trail.
    """
    user = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs"
    )
    company = models.ForeignKey(
        "companies.Company", on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs"
    )
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=500)
    status_code = models.PositiveSmallIntegerField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    request_body = models.JSONField(default=dict, blank=True)
    duration_ms = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]
        # Partition by month is ideal for large deployments — done at DB level
        indexes = [
            models.Index(fields=["company", "-created_at"]),
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["path", "method"]),
        ]

    def __str__(self):
        return f"{self.method} {self.path} [{self.status_code}] by {self.user}"

    def save(self, *args, **kwargs):
        # Prevent updates — audit logs are immutable
        if self.pk and not kwargs.get("force_insert"):
            return
        super().save(*args, **kwargs)
