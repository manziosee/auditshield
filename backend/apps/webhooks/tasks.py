"""
Celery tasks for webhook delivery.

Delivers JSON payloads to registered endpoints, signed with HMAC-SHA256.
Retries up to 3 times on network/HTTP errors with exponential back-off.
"""
import hashlib
import hmac
import json
import logging

import requests
from celery import shared_task

logger = logging.getLogger("auditshield")

# Timeout for outbound webhook HTTP requests (seconds)
REQUEST_TIMEOUT = 10


def _sign_payload(secret: str, body: bytes) -> str:
    """Return sha256=<hex_digest> HMAC signature."""
    digest = hmac.new(
        secret.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256,
    ).hexdigest()
    return f"sha256={digest}"


@shared_task(
    name="apps.webhooks.tasks.deliver_webhook",
    bind=True,
    max_retries=3,
    default_retry_delay=30,  # seconds; doubles on each retry via countdown
)
def deliver_webhook(self, endpoint_id: str, event_type: str, payload: dict):
    """
    Deliver a signed webhook payload to a registered endpoint.

    Args:
        endpoint_id: UUID of the WebhookEndpoint record.
        event_type:  e.g. "compliance.record.updated"
        payload:     Dict that will be JSON-serialised as the request body.
    """
    from .models import WebhookEndpoint

    try:
        endpoint = WebhookEndpoint.objects.get(id=endpoint_id, is_active=True)
    except WebhookEndpoint.DoesNotExist:
        logger.warning("deliver_webhook: endpoint %s not found or inactive — skipping.", endpoint_id)
        return

    # Filter by subscribed events (empty list = all events)
    if endpoint.events and event_type not in endpoint.events:
        logger.debug(
            "deliver_webhook: endpoint %s not subscribed to %s — skipping.",
            endpoint_id,
            event_type,
        )
        return

    body = json.dumps({"event": event_type, "data": payload}, default=str).encode("utf-8")
    signature = _sign_payload(endpoint.secret, body)

    headers = {
        "Content-Type": "application/json",
        "X-AuditShield-Signature": signature,
        "X-AuditShield-Event": event_type,
        "User-Agent": "AuditShield-Webhook/1.0",
    }

    try:
        resp = requests.post(
            endpoint.url,
            data=body,
            headers=headers,
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        logger.info(
            "deliver_webhook: delivered %s to %s — HTTP %s",
            event_type,
            endpoint.url,
            resp.status_code,
        )
    except Exception as exc:
        attempt = self.request.retries + 1
        logger.warning(
            "deliver_webhook: attempt %s failed for endpoint %s (%s): %s",
            attempt,
            endpoint_id,
            endpoint.url,
            exc,
        )
        # Exponential back-off: 30s, 60s, 120s
        raise self.retry(exc=exc, countdown=30 * (2 ** self.request.retries))
