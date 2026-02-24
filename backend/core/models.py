"""
Abstract base models shared across all apps.
"""
import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """Adds created_at and updated_at to every model."""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UUIDModel(models.Model):
    """Uses UUID as primary key instead of sequential integers — harder to enumerate."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TenantModel(TimeStampedModel, UUIDModel):
    """
    Base model for all company-scoped records.
    Enforces that every record belongs to a company.
    """
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="%(app_label)s_%(class)s_set",
    )

    class Meta:
        abstract = True
