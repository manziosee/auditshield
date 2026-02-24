"""
Employee signals.
- Notify HR/Admin when an employee's contract is about to expire.
- Auto-update employment_status to 'terminated' when termination_date passes.
"""
import logging

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Employee

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Employee)
def auto_set_employment_status(sender, instance, **kwargs):
    """
    If termination_date is set and in the past, mark the employee as terminated.
    Runs before save so the DB always reflects real status.
    """
    today = timezone.now().date()
    if instance.termination_date and instance.termination_date <= today:
        if instance.employment_status not in (
            Employee.EmploymentStatus.TERMINATED,
            Employee.EmploymentStatus.RESIGNED,
        ):
            instance.employment_status = Employee.EmploymentStatus.TERMINATED
            instance.is_active = False


@receiver(post_save, sender=Employee)
def notify_contract_expiry(sender, instance, created, **kwargs):
    """
    After saving, queue a notification if contract ends within 30 days.
    Only fires when contract_end_date changes or on new record.
    """
    if not instance.contract_end_date:
        return

    today = timezone.now().date()
    days_left = (instance.contract_end_date - today).days

    if 0 < days_left <= 30:
        try:
            from apps.notifications.models import Notification

            # Avoid duplicate notifications — check recent ones
            recent = Notification.objects.filter(
                company=instance.company,
                notification_type=Notification.NotificationType.CONTRACT_RENEWAL,
                related_object_id=instance.id,
            ).exists()

            if not recent:
                # Notify all company admins + HR
                from apps.accounts.models import User
                admins = User.objects.filter(
                    company=instance.company,
                    role__in=[User.Role.COMPANY_ADMIN, User.Role.HR],
                    is_active=True,
                )
                notifications = [
                    Notification(
                        company=instance.company,
                        recipient=admin,
                        notification_type=Notification.NotificationType.CONTRACT_RENEWAL,
                        title=f"Contract expiring soon: {instance.full_name}",
                        body=(
                            f"{instance.full_name} ({instance.employee_number})'s contract "
                            f"expires in {days_left} day(s) on {instance.contract_end_date}."
                        ),
                        related_object_id=instance.id,
                        related_object_type="employee",
                    )
                    for admin in admins
                ]
                Notification.objects.bulk_create(notifications, ignore_conflicts=True)
                logger.info(
                    "Contract expiry notifications created for employee %s (%d days)",
                    instance.employee_number, days_left,
                )
        except Exception as exc:
            logger.error("Failed to send contract expiry notification: %s", exc)
