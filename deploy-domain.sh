#!/bin/bash

source .env

REMOTE_USER="root"
REMOTE_HOST="${REMOTE_DOMAIN_HOST}"
REMOTE_PORT="${REMOTE_DOMAIN_PORT:-22}"
REMOTE_TRAEFIK_PATH="/data/coolify/proxy/dynamic"
LOCAL_PATH="$(pwd)"
CONFIG_FILE="smtp-node-api-traefik-config.yml"

if [ -z "${REMOTE_DOMAIN_HOST}" ]; then
  echo "❌ Error: REMOTE_DOMAIN_HOST is not set in .env"
  exit 1
fi

echo "🔄 Deploying SMTP Node API domain configuration to ${REMOTE_HOST}..."

# Check if the config file exists
if [ ! -f "${LOCAL_PATH}/${CONFIG_FILE}" ]; then
  echo "❌ Error: ${CONFIG_FILE} not found in ${LOCAL_PATH}"
  exit 1
fi

echo "🔧 Checking if remote Traefik directory exists..."
ssh -p $REMOTE_PORT ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_TRAEFIK_PATH}"


if [ -z "${REMOTE_SERVICE_IP}" ]; then
  echo "❌ Error: REMOTE_SERVICE_IP is not set in .env"
  exit 1
fi

if [ -z "${PUBLISHED_DOMAIN}" ]; then
  echo "❌ Error: PUBLISHED_DOMAIN is not set in .env"
  exit 1
fi

echo "📦 Copying Traefik configuration to remote server..."

#scp -P $REMOTE_PORT "${LOCAL_PATH}/${CONFIG_FILE}" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_TRAEFIK_PATH}/

# Escape variables for sed
REMOTE_SERVICE_IP_ESCAPED=$(printf '%s\n' "$REMOTE_SERVICE_IP" | sed 's/[\/&]/\\&/g')
PUBLISHED_DOMAIN_ESCAPED=$(printf '%s\n' "$PUBLISHED_DOMAIN" | sed 's/[\/&]/\\&/g')

# Use pipe character as delimiter for sed to avoid issues with slashes
sed "s|REMOTE_SERVICE_IP|${REMOTE_SERVICE_IP_ESCAPED}|g" "${LOCAL_PATH}/${CONFIG_FILE}" > "${LOCAL_PATH}/${CONFIG_FILE}.tmp1"
sed "s|_PUBLISHED_DOMAIN_|${PUBLISHED_DOMAIN_ESCAPED}|g" "${LOCAL_PATH}/${CONFIG_FILE}.tmp1" > "${LOCAL_PATH}/${CONFIG_FILE}.tmp"
rm "${LOCAL_PATH}/${CONFIG_FILE}.tmp1"

scp -P $REMOTE_PORT "${LOCAL_PATH}/${CONFIG_FILE}.tmp" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_TRAEFIK_PATH}/${CONFIG_FILE}

rm "${LOCAL_PATH}/${CONFIG_FILE}.tmp"

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
  