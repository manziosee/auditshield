from celery import shared_task
from django.utils import timezone


@shared_task(bind=True, max_retries=3)
def sync_integration(self, integration_id: str):
    """Trigger a sync for a given integration. Stub — extend per integration type."""
    from .models import Integration
    try:
        integration = Integration.objects.get(id=integration_id)
        # TODO: Add per-type sync logic here (BambooHR API, QuickBooks OAuth, etc.)
        integration.sync_status = "success"
        integration.last_sync_at = timezone.now()
        integration.error_message = ""
        integration.save(update_fields=["sync_status", "last_sync_at", "error_message"])
    except Integration.DoesNotExist:
        pass
    except Exception as exc:
        from .models import Integration
        try:
            integration = Integration.objects.get(id=integration_id)
            integration.sync_status = "error"
            integration.error_message = str(exc)
            integration.save(update_fields=["sync_status", "error_message"])
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))
