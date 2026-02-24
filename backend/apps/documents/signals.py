"""
Document signals.
- Notify company admins when a document is about to expire (30 / 7 days).
- Auto-mark documents as expired when expiry_date has passed.
"""
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Document

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Document)
def check_document_expiry_on_save(sender, instance, created, **kwargs):
    """
    When a document is saved or updated, check if it just became expired
    and update its status automatically.
    """
    if instance.expiry_date is None:
        return

    today = timezone.now().date()

    # If expired and not yet marked
    if instance.expiry_date < today and instance.status not in (
        Document.Status.EXPIRED, Document.Status.ARCHIVED
    ):
        Document.objects.filter(pk=instance.pk).update(status=Document.Status.EXPIRED)
        logger.info("Document %s auto-marked as expired.", instance.title)
