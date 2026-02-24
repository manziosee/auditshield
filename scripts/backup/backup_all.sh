#!/usr/bin/env bash
# ─── AuditShield Full Backup ──────────────────────────────────────────────────
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "${DIR}/backup_db.sh"
bash "${DIR}/backup_media.sh"
echo "[$(date)] Full backup complete."
