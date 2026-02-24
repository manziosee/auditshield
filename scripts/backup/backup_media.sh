#!/usr/bin/env bash
# ─── AuditShield Media Files Backup ──────────────────────────────────────────
# Creates an encrypted tar.gz archive of the /media directory.
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/backups/media}"
MEDIA_DIR="${MEDIA_ROOT:-/app/media}"
FILENAME="auditshield_media_${TIMESTAMP}.tar.gz"
COMPRESSED="${BACKUP_DIR}/${FILENAME}"
ENCRYPTED="${COMPRESSED}.gpg"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting media backup (${MEDIA_DIR})..."

tar -czf "${COMPRESSED}" -C "$(dirname "${MEDIA_DIR}")" "$(basename "${MEDIA_DIR}")"

gpg --batch --yes \
  --passphrase "${BACKUP_ENCRYPTION_PASSPHRASE}" \
  --symmetric \
  --cipher-algo AES256 \
  --output "${ENCRYPTED}" \
  "${COMPRESSED}"

rm -f "${COMPRESSED}"

echo "[$(date)] Media backup saved: ${ENCRYPTED} ($(du -sh "${ENCRYPTED}" | cut -f1))"

find "${BACKUP_DIR}" -name "*.gpg" -mtime +"${RETENTION_DAYS}" -delete

if command -v rclone &>/dev/null && [ -n "${RCLONE_REMOTE:-}" ]; then
  rclone copy "${ENCRYPTED}" "${RCLONE_REMOTE}/media/"
fi
