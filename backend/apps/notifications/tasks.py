"""
Celery tasks for sending notifications via email and in-app.
"""
import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger("auditshield")


@shared_task(name="apps.notifications.tasks.send_expiry_notification")
def send_expiry_notification(document_id: str, days_left: int):
    from apps.accounts.models import User
    from apps.documents.models import Document

    from .models import Notification

    try:
        doc = Document.objects.select_related("company").get(id=document_id)
        # Notify all admins + HR in the company
        recipients = User.objects.filter(
            company=doc.company,
            role__in=["admin", "hr", "accountant"],
            is_active=True,
        )
        for user in recipients:
            notif = Notification.objects.create(
                company=doc.company,
                recipient=user,
                notification_type=Notification.NotificationType.DOCUMENT_EXPIRY,
                title=f"Document expiring in {days_left} days",
                body=f'"{doc.title}" will expire on {doc.expiry_date}. Please renew it before the deadline.',
                related_object_id=doc.id,
                related_object_type="document",
            )
            # Send email
            try:
                send_mail(
                    subject=notif.title,
                    message=notif.body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
                notif.is_sent_email = True
                notif.sent_at = timezone.now()
                notif.save(update_fields=["is_sent_email", "sent_at"])
            except Exception as e:
                logger.warning("Email send failed for user %s: %s", user.email, e)
    except Exception as exc:
        logger.exception("send_expiry_notification failed: %s", exc)


@shared_task(name="apps.notifications.tasks.send_compliance_reminders")
def send_compliance_reminders():
    from datetime import timedelta

    from django.utils import timezone

    from apps.accounts.models import User
    from apps.compliance.models import ComplianceRecord

    from .models import Notification

    today = timezone.now().date()
    upcoming = ComplianceRecord.objects.filter(
        due_date__lte=today + timedelta(days=7),
        status=ComplianceRecord.ComplianceStatus.PENDING,
    ).select_related("company", "requirement")

    for record in upcoming:
        admins = User.objects.filter(company=record.company, role__in=["admin", "accountant"], is_active=True)
        for user in admins:
            Notification.objects.get_or_create(
                company=record.company,
                recipient=user,
                notification_type=Notification.NotificationType.COMPLIANCE_DUE,
                related_object_id=record.id,
                related_object_type="compliance_record",
                defaults={
                    "title": f"Compliance deadline: {record.requirement.title}",
                    "body": f"Due on {record.due_date}. Please ensure this is completed on time.",
                },
            )
