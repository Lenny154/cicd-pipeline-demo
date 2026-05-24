#!/bin/bash
# deploy.sh — copy this to /opt/deploy.sh on your server
set -e

IMAGE=$1
CONTAINER="cicd-app"
PORT=3000

echo "[deploy] Pulling latest image: $IMAGE"
docker pull "$IMAGE"

echo "[deploy] Stopping old container (if running)"
docker stop "$CONTAINER" 2>/dev/null || true
docker rm "$CONTAINER" 2>/dev/null || true

echo "[deploy] Starting new container"
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  -p $PORT:3000 \
  -e NODE_ENV=production \
  -e APP_VERSION="$(date +%Y%m%d%H%M%S)" \
  "$IMAGE"

echo "[deploy] Waiting for health check..."
sleep 5
curl -sf http://localhost:$PORT/health && echo "[deploy] Health check passed!" || {
  echo "[deploy] Health check FAILED — rolling back"
  docker stop "$CONTAINER"
  exit 1
}

echo "[deploy] Deployment complete"
