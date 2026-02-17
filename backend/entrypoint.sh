#!/bin/sh
set -e

echo "Starting backend entrypoint..."

RETRY_INTERVAL=2
echo "Running prisma migrate deploy (will retry until DB is ready)"
until npx prisma migrate deploy; do
  echo "Prisma migrate failed; retrying in ${RETRY_INTERVAL}s..."
  sleep ${RETRY_INTERVAL}
done

echo "Migrations applied. Starting application."
exec node dist/index.js
