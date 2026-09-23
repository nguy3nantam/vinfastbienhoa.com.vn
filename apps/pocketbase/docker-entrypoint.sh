#!/bin/sh
set -eu

if [ -z "${PB_ENCRYPTION_KEY:-}" ]; then
  echo "PB_ENCRYPTION_KEY is required" >&2
  exit 1
fi

# Older deploy-vps.sh versions generated 64 hex characters. PocketBase accepts
# exactly 32 characters, so preserve existing installations deterministically
# while new deployments already receive a correctly sized key.
PB_RUNTIME_ENCRYPTION_KEY="$(printf '%.32s' "$PB_ENCRYPTION_KEY")"
export PB_RUNTIME_ENCRYPTION_KEY

exec ./pocketbase serve \
  --http=0.0.0.0:8090 \
  --encryptionEnv=PB_RUNTIME_ENCRYPTION_KEY \
  --dir=/data \
  --migrationsDir=./pb_migrations \
  --hooksDir=./pb_hooks \
  --hooksWatch=false
