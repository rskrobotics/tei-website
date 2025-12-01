#!/bin/bash

# Simple deployment script - copies dist/ to remote server
# Configuration via environment variables

# Load environment variables from .env if it exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$DEPLOY_USER" ] || [ -z "$DEPLOY_HOST" ] || [ -z "$DEPLOY_PATH" ]; then
    echo "❌ Error: Required environment variables not set."
    echo ""
    echo "Please set the following environment variables:"
    echo "  DEPLOY_USER - Remote server username"
    echo "  DEPLOY_HOST - Remote server hostname or IP"
    echo "  DEPLOY_PATH - Remote deployment path"
    echo ""
    echo "You can create a .env file with these variables or set them in your shell."
    exit 1
fi

echo "🚀 Deploying to $DEPLOY_HOST..."

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ folder not found. Run 'npm run build' first."
    exit 1
fi

# Sync files using rsync (preserves permissions, faster than scp)
# The --rsync-path option creates the directory if needed, avoiding a separate SSH call
rsync -avz --delete --rsync-path="mkdir -p ${DEPLOY_PATH} && rsync" dist/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "Files deployed to: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"
else
    echo "❌ Deployment failed!"
    exit 1
fi
