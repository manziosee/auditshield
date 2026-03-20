from celery import shared_task
from datetime import date, timedelta


@shared_task
def check_certification_expiry():
    """Daily task: update cert statuses and send expiry notifications."""
    from .models import EmployeeCertification
    from apps.notifications.models import Notification

    today = date.today()
    soon = today + timedelta(days=30)

    # Mark expired
    expired_qs = EmployeeCertification.objects.filter(
        expiry_date__lt=today, status__in=["valid", "expiring_soon"]
    )
    expired_qs.update(status="expired")

    # Mark expiring soon
    expiring_qs = EmployeeCertification.objects.filter(
        expiry_date__range=[today, soon], status="valid"
    )
    expiring_qs.update(status="expiring_soon")

    # Send notifications for expiring soon
    for cert in EmployeeCertification.objects.filter(
        expiry_date__range=[today, soon]
    ).select_related("employee__user", "certification_type", "company"):
        days = (cert.expiry_date - today).days
        if hasattr(cert.employee, "user") and cert.employee.user:
            Notification.objects.get_or_create(
                company=cert.company,
                user=cert.employee.user,
                notification_type="reminder",
                title=f"Certification expiring in {days} days",
                defaults={
                    "message": (
                        f"{cert.certification_type.name} for {cert.employee.first_name} "
                        f"{cert.employee.last_name} expires on {cert.expiry_date}."
                    )
                }
            )
