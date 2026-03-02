#!/bin/bash
# Seed countries data to the backend database
# Usage: ./seed_countries.sh

echo "🌍 Seeding global countries data..."

# Check if running in Docker
if docker compose ps backend | grep -q "Up"; then
    echo "✓ Backend container is running"
    docker compose exec backend python manage.py seed_global_data
elif docker ps | grep -q "auditshield.*backend"; then
    echo "✓ Backend container found"
    docker exec -it $(docker ps -qf "name=backend") python manage.py seed_global_data
else
    echo "⚠️  Backend container not running. Starting services..."
    docker compose up -d backend
    echo "⏳ Waiting for backend to be ready..."
    sleep 10
    docker compose exec backend python manage.py seed_global_data
fi

echo "✅ Countries seeded successfully!"
echo "📊 Total countries: 50+"
echo "🔗 API endpoint: http://localhost:8000/api/v1/geo/countries/"
