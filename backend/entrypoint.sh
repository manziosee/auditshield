#!/bin/sh
set -e

echo "🚀 Starting AuditShield backend..."

# Run migrations
python manage.py migrate --noinput

# Seed global data if not already seeded
python manage.py seed_global_data --noinput 2>/dev/null || echo "✓ Global data already seeded"

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
exec gunicorn auditshield.wsgi:application \
  --bind 0.0.0.0:${PORT:-8080} \
  --workers 2 \
  --threads 4 \
  --worker-class gthread \
  --worker-tmp-dir /dev/shm \
  --access-logfile - \
  --error-logfile - \
  --log-level info
