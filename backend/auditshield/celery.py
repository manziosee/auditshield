import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "auditshield.settings.development")

app = Celery("auditshield")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# ─── Scheduled Tasks ──────────────────────────────────────────────────────────
app.conf.beat_schedule = {
    # Daily DB + media backup at 2 AM Kigali time
    "daily-backup": {
        "task": "core.tasks.run_backup",
        "schedule": crontab(hour=2, minute=0),
    },
    # Send compliance reminders every Monday at 9 AM
    "weekly-compliance-reminders": {
        "task": "apps.notifications.tasks.send_compliance_reminders",
        "schedule": crontab(day_of_week=1, hour=9, minute=0),
    },
    # Check document expiries daily
    "check-document-expiries": {
        "task": "apps.documents.tasks.check_document_expiries",
        "schedule": crontab(hour=8, minute=0),
    },
    # Cleanup expired JWT tokens weekly
    "cleanup-expired-tokens": {
        "task": "apps.accounts.tasks.cleanup_expired_tokens",
        "schedule": crontab(day_of_week=0, hour=3, minute=0),
    },
}
