"""
Company signals.
- When a new Company is created, seed default ComplianceCategories and
  ComplianceRequirements so every tenant starts with a pre-populated checklist.
"""
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender="companies.Company")
def seed_compliance_requirements(sender, instance, created, **kwargs):
    """
    On first save, create ComplianceRecords for all mandatory requirements
    so the new company has a visible compliance checklist from day 1.
    """
    if not created:
        return

    try:
        from django.utils import timezone
        from apps.compliance.models import ComplianceRequirement, ComplianceRecord

        today = timezone.now().date()
        requirements = ComplianceRequirement.objects.filter(is_mandatory=True)

        records = []
        for req in requirements:
            # Simple period: current calendar year
            period_start = today.replace(month=1, day=1)
            period_end = today.replace(month=12, day=31)
            due_day = req.deadline_day or 15
            due_date = today.replace(day=min(due_day, 28))

            records.append(
                ComplianceRecord(
                    company=instance,
                    requirement=req,
                    status=ComplianceRecord.ComplianceStatus.PENDING,
                    period_start=period_start,
                    period_end=period_end,
                    due_date=due_date,
                )
            )

        ComplianceRecord.objects.bulk_create(records, ignore_conflicts=True)
        logger.info("Seeded %d compliance records for new company: %s", len(records), instance.name)
    except Exception as exc:  # pragma: no cover
        logger.error("Failed to seed compliance records for %s: %s", instance.name, exc)
