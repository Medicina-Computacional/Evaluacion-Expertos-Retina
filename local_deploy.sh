#!/bin/bash

# Configuration
# Replace these with your actual values or pass them as arguments
SERVER_IP="$1"
KEY_PATH="$2"
USER="ubuntu"
REPO_URL="https://github.com/Medicina-Computacional/Evaluacion-Expertos-Retina.git"
REMOTE_DIR="Evaluacion-Expertos-Retina"

if [ -z "$SERVER_IP" ] || [ -z "$KEY_PATH" ]; then
    echo "Usage: ./local_deploy.sh <SERVER_IP> <PATH_TO_KEY_PEM>"
    echo "Example: ./local_deploy.sh 54.123.45.67 ~/Downloads/retina-key.pem"
    exit 1
fi

echo "Deploying to $SERVER_IP using key $KEY_PATH..."

# 1. Update Permissions on Key
chmod 400 "$KEY_PATH"

# 2. Clone Repo on Server (Skip if exists)
echo "Step 1: Setting up repository on server..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no $USER@$SERVER_IP << EOF
    if [ ! -d "$REMOTE_DIR" ]; then
        git clone $REPO_URL $REMOTE_DIR
    else
        echo "Repo already exists, pulling updates..."
        cd $REMOTE_DIR
        git pull origin main
    fi
EOF

# 3. Create database directory if it doesn't exist
echo "Step 2: Preparing database directory..."
ssh -i "$KEY_PATH" $USER@$SERVER_IP "mkdir -p ~/$REMOTE_DIR/database"

# 4. SCP Images
echo "Step 3: Uploading images (this may take a while)..."
# We upload the CONTENTS of the local database folder to the remote database folder
scp -i "$KEY_PATH" -r database/* $USER@$SERVER_IP:~/$REMOTE_DIR/database/

# 5. Run Setup Script
echo "Step 4: Running server setup..."
ssh -i "$KEY_PATH" $USER@$SERVER_IP "bash ~/$REMOTE_DIR/setup_server.sh"

echo "========================================"
echo "Deployment Complete!"
echo "Visit http://$SERVER_IP to access the application."
echo "========================================"
