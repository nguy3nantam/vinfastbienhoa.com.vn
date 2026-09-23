#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")" && pwd)}"

cd "$APP_DIR"

if [ ! -d "./pb_data" ] && [ -d "./apps/pocketbase/pb_data" ]; then
  cp -r ./apps/pocketbase/pb_data ./pb_data
fi

if [ ! -f ".env" ]; then
  # PocketBase expects the encryption key to be exactly 32 characters.
  PB_KEY="$(openssl rand -hex 16)"
  PB_PASS="$(openssl rand -base64 18 | tr -d '=+/ ' | cut -c1-18)"
  {
    echo "PB_ENCRYPTION_KEY=$PB_KEY"
    echo "PB_SUPERUSER_EMAIL=admin@example.com"
    echo "PB_SUPERUSER_PASSWORD=$PB_PASS"
  } > .env
  echo "Created .env"
  echo "PocketBase admin email: admin@example.com"
  echo "PocketBase admin password: $PB_PASS"
else
  echo "Using existing .env"
fi

chmod +x ./apps/pocketbase/pocketbase

if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
else
  echo "Docker Compose is not installed."
  exit 1
fi

$DOCKER_COMPOSE up -d --build
$DOCKER_COMPOSE ps

echo "Waiting for the public endpoint..."
attempt=0
until curl -fsS --max-time 10 "${SMOKE_BASE_URL:-https://vinfastbienhoa.com.vn}/" >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 12 ]; then
    echo "Deployment failed its readiness check."
    exit 1
  fi
  sleep 5
done

npm run smoke
