#!/bin/sh
# Fly.io production entrypoint — runs on every machine start
set -e

echo "==> Ensuring data directories exist..."
mkdir -p /data/media /data/staticfiles

echo "==> Running database migrations..."
python manage.py migrate --noinput

echo "==> Seeding global reference data (countries, currencies, authorities)..."
python manage.py seed_global_data --noinput 2>/dev/null || true

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "==> Starting Gunicorn on port ${PORT:-8080}..."
exec gunicorn auditshield.wsgi:application \
  --bind "0.0.0.0:${PORT:-8080}" \
  --workers "${GUNICORN_WORKERS:-2}" \
  --threads 2 \
  --worker-class gthread \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --log-level info \
  --access-logfile - \
  --error-logfile -
