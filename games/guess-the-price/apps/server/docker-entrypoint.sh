#!/bin/sh
set -e

echo "=== Guess The Price Backend Initialization ==="

# Wait briefly for Postgres to be accepting connections
echo "Checking database connection..."
until npx prisma migrate deploy; do
  echo "Database not ready yet, retrying in 2 seconds..."
  sleep 2
done

echo "Database migrations applied successfully!"

# Seed products and categories
echo "Seeding initial product catalog..."
npm run seed || echo "Seed completed or skipped."

echo "Starting Guess The Price backend on port ${PORT:-3005}..."
exec npm run start
