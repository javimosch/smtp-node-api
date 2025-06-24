#!/bin/bash

source .env

REMOTE_USER="ubuntu"
REMOTE_HOST="${REMOTE_HOST}"
REMOTE_PORT="22"
REMOTE_PATH="~/docker/smtp-node-api"
LOCAL_PATH="$(pwd)"

if [ -z "${REMOTE_HOST}" ]; then
  echo "❌ Error: REMOTE_HOST is not set in .env"
  exit 1
fi

echo "🔧 Ensuring remote directory exists at ${REMOTE_HOST}:${REMOTE_PATH}..."
ssh -p $REMOTE_PORT ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}"

echo "📦 Syncing local files from ${LOCAL_PATH} to remote..."
rsync -avz --progress -e "ssh -p $REMOTE_PORT" "$LOCAL_PATH/" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

echo "🐳 Running docker-compose up on remote host..."
ssh -p $REMOTE_PORT ${REMOTE_USER}@${REMOTE_HOST} << EOF
  cd ${REMOTE_PATH}
  docker-compose up -d
  echo "⏳ Waiting 5 seconds for containers to start..."
  sleep 5
  echo "📜 Tailing last 100 lines of logs from 'web' service..."
  docker-compose logs --tail=100 web
EOF

echo "✅ Deployment complete."
