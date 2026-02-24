#!/usr/bin/env bash
# ─── AuditShield Database Backup ─────────────────────────────────────────────
# Creates an encrypted, compressed PostgreSQL dump.
# Usage: ./backup_db.sh
# Env vars: POSTGRES_*, BACKUP_ENCRYPTION_PASSPHRASE, BACKUP_RETENTION_DAYS
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/backups/db}"
FILENAME="auditshield_db_${TIMESTAMP}.sql"
COMPRESSED="${BACKUP_DIR}/${FILENAME}.gz"
ENCRYPTED="${COMPRESSED}.gpg"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting database backup..."

# Dump
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "${POSTGRES_HOST:-db}" \
  -U "${POSTGRES_USER:-auditshield_user}" \
  -d "${POSTGRES_DB:-auditshield_db}" \
  --no-owner \
  --no-acl \
  --format=plain \
  | gzip -9 > "${COMPRESSED}"

# Encrypt (symmetric GPG)
gpg --batch --yes \
  --passphrase "${BACKUP_ENCRYPTION_PASSPHRASE}" \
  --symmetric \
  --cipher-algo AES256 \
  --output "${ENCRYPTED}" \
  "${COMPRESSED}"

# Remove unencrypted compressed file
rm -f "${COMPRESSED}"

echo "[$(date)] Backup saved: ${ENCRYPTED} ($(du -sh "${ENCRYPTED}" | cut -f1))"

# Prune old backups
find "${BACKUP_DIR}" -name "*.gpg" -mtime +"${RETENTION_DAYS}" -delete
echo "[$(date)] Pruned backups older than ${RETENTION_DAYS} days"

# Optional: copy to remote (requires rclone configured)
if command -v rclone &>/dev/null && [ -n "${RCLONE_REMOTE:-}" ]; then
  rclone copy "${ENCRYPTED}" "${RCLONE_REMOTE}/db/"
  echo "[$(date)] Uploaded to ${RCLONE_REMOTE}/db/"
fi
