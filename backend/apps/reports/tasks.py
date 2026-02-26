"""
Celery task: generate PDF audit report using WeasyPrint.
"""
import logging

from celery import shared_task

logger = logging.getLogger("auditshield")


@shared_task(name="apps.reports.tasks.generate_report", bind=True, max_retries=2)
def generate_report(self, report_id: str):
    from .generators import build_report_pdf
    from .models import Report

    try:
        report = Report.objects.select_related("company", "generated_by").get(id=report_id)
        build_report_pdf(report)
        report.is_ready = True
        report.save(update_fields=["is_ready", "file"])
        logger.info("Report %s generated successfully", report_id)
    except Exception as exc:
        logger.exception("Report generation failed for %s: %s", report_id, exc)
        raise self.retry(exc=exc, countdown=60)
