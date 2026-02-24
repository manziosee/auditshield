#!/usr/bin/env bash
# ─── AuditShield Database Restore ────────────────────────────────────────────
# Usage: BACKUP_FILE=/backups/db/auditshield_db_20240101_020000.sql.gz.gpg ./restore_db.sh
set -euo pipefail

BACKUP_FILE="${1:-${BACKUP_FILE:-}}"
if [ -z "${BACKUP_FILE}" ]; then
  echo "Usage: $0 <path-to-backup.sql.gz.gpg>" >&2
  exit 1
fi

echo "WARNING: This will REPLACE the current database contents!"
echo "Press CTRL+C to cancel, or ENTER to continue..."
read -r

TMPFILE=$(mktemp /tmp/restore_XXXXXX.sql)

echo "[$(date)] Decrypting backup..."
gpg --batch --yes \
  --passphrase "${BACKUP_ENCRYPTION_PASSPHRASE}" \
  --decrypt "${BACKUP_FILE}" \
  | gunzip > "${TMPFILE}"

echo "[$(date)] Restoring database..."
PGPASSWORD="${POSTGRES_PASSWORD}" psql \
  -h "${POSTGRES_HOST:-db}" \
  -U "${POSTGRES_USER:-auditshield_user}" \
  -d "${POSTGRES_DB:-auditshield_db}" \
  < "${TMPFILE}"

rm -f "${TMPFILE}"
echo "[$(date)] Database restore complete."
