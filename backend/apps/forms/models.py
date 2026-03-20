import uuid
from django.conf import settings
from django.db import models
from core.models import TenantModel


class FormTemplate(TenantModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        db_table = "forms_templates"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class FormField(models.Model):
    class FieldType(models.TextChoices):
        TEXT = "text", "Text"
        TEXTAREA = "textarea", "Text Area"
        NUMBER = "number", "Number"
        DATE = "date", "Date"
        SELECT = "select", "Select"
        CHECKBOX = "checkbox", "Checkbox"
        RADIO = "radio", "Radio"
        FILE = "file", "File Upload"
        SIGNATURE = "signature", "Signature"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE, related_name="fields")
    label = models.CharField(max_length=200)
    field_type = models.CharField(max_length=20, choices=FieldType.choices)
    is_required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    placeholder = models.CharField(max_length=200, blank=True)
    help_text = models.CharField(max_length=300, blank=True)

    class Meta:
        db_table = "forms_fields"
        ordering = ["order"]


class FormSubmission(TenantModel):
    template = models.ForeignKey(FormTemplate, on_delete=models.CASCADE, related_name="submissions")
    employee = models.ForeignKey("employees.Employee", null=True, blank=True, on_delete=models.SET_NULL)
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    data = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[("draft", "Draft"), ("submitted", "Submitted"), ("reviewed", "Reviewed")],
        default="submitted"
    )

    class Meta:
        db_table = "forms_submissions"
        ordering = ["-submitted_at"]
