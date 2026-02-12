#!/bin/sh
set -e

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Running database migrations."
  node dist/scripts/db-migrate.js
else
  echo "[entrypoint] Skipping database migrations (RUN_DB_MIGRATIONS=false)."
fi

exec node dist/main
