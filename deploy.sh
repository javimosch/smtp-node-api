#!/bin/bash

REMOTE_USER="ubuntu"
REMOTE_HOST="100.86.93.41"
REMOTE_PORT="22"
REMOTE_PATH="~/docker/smtp-node-api"
LOCAL_PATH="$(pwd)"

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
