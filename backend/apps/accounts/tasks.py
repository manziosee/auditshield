from celery import shared_task
from django.utils import timezone


@shared_task(name="apps.accounts.tasks.cleanup_expired_tokens")
def cleanup_expired_tokens():
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
    OutstandingToken.objects.filter(expires_at__lt=timezone.now()).delete()
