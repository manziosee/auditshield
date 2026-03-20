import uuid
from django.conf import settings
from django.db import models
from core.models import TenantModel


class SignatureRequest(TenantModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PARTIAL = "partial", "Partial"
        COMPLETED = "completed", "Completed"
        EXPIRED = "expired", "Expired"

    document = models.ForeignKey(
        "documents.Document", on_delete=models.CASCADE, related_name="signature_requests"
    )
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="created_signature_requests"
    )

    class Meta:
        db_table = "signatures_requests"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def update_status(self):
        signers = self.signers.all()
        if not signers.exists():
            return
        total = signers.count()
        signed = signers.filter(status="signed").count()
        if signed == 0:
            self.status = self.Status.PENDING
        elif signed < total:
            self.status = self.Status.PARTIAL
        else:
            self.status = self.Status.COMPLETED
        self.save(update_fields=["status"])


class SignatureRequestSigner(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SIGNED = "signed", "Signed"
        DECLINED = "declined", "Declined"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request = models.ForeignKey(SignatureRequest, on_delete=models.CASCADE, related_name="signers")
    employee = models.ForeignKey("employees.Employee", on_delete=models.CASCADE)
    role = models.CharField(max_length=50, default="signer")
    order = models.PositiveSmallIntegerField(default=0)
    signed_at = models.DateTimeField(null=True, blank=True)
    signature_data = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    class Meta:
        db_table = "signatures_signers"
        ordering = ["order"]

    def __str__(self):
        return f"{self.employee} — {self.request.title}"
