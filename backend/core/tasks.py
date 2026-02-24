"""Celery task: trigger the backup scripts from Django."""
import subprocess
import logging
from celery import shared_task

logger = logging.getLogger("auditshield")


@shared_task(name="core.tasks.run_backup", bind=True, max_retries=2)
def run_backup(self):
    try:
        result = subprocess.run(
            ["/app/scripts/backup/backup_all.sh"],
            capture_output=True,
            text=True,
            timeout=600,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr)
        logger.info("Backup completed successfully: %s", result.stdout)
    except Exception as exc:
        logger.error("Backup failed: %s", exc)
        raise self.retry(exc=exc, countdown=300)
