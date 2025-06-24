#!/bin/bash

REMOTE_USER="root"
REMOTE_HOST="188.245.71.48"
REMOTE_PORT="22"
REMOTE_TRAEFIK_PATH="/data/coolify/proxy/dynamic"
LOCAL_PATH="$(pwd)"
CONFIG_FILE="smtp-node-api-traefik-config.yml"

echo "🔄 Deploying SMTP Node API domain configuration to ${REMOTE_HOST}..."

# Check if the config file exists
if [ ! -f "${LOCAL_PATH}/${CONFIG_FILE}" ]; then
  echo "❌ Error: ${CONFIG_FILE} not found in ${LOCAL_PATH}"
  exit 1
fi

echo "🔧 Checking if remote Traefik directory exists..."
ssh -p $REMOTE_PORT ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_TRAEFIK_PATH}"

echo "📦 Copying Traefik configuration to remote server..."
scp -P $REMOTE_PORT "${LOCAL_PATH}/${CONFIG_FILE}" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_TRAEFIK_PATH}/

echo "🔄 Verifying file was copied successfully..."
ssh -p $REMOTE_PORT ${REMOTE_USER}@${REMOTE_HOST} "ls -la ${REMOTE_TRAEFIK_PATH}/${CONFIG_FILE}"


echo "✅ Domain configuration deployment complete."
echo "🌐 Your API should now be accessible at: https://smtp-node-api.coolify.intrane.fr"

echo "cURL to test the API:"
echo "curl https://smtp-node-api.coolify.intrane.fr/health"

# Try curl each 5s
N=0
while true; do

  echo "Waiting for API to be accessible... ($N times)"

  if curl "https://smtp-node-api.coolify.intrane.fr/health" | grep -q "ok"; then
    echo "✅ API is now accessible at: https://smtp-node-api.coolify.intrane.fr"
    break
  fi
  sleep 5
  N=$((N+1))
done
  