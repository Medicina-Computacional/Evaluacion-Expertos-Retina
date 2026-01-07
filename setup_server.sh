#!/bin/bash

# Determine project root based on script location
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Project Root detected at: $PROJECT_ROOT"

# Update System
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Dependencies
echo "Installing dependencies..."
# Add NodeSource repo for Node.js 20 (Required for Vite 7+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y python3-pip python3-venv nodejs nginx git acl
# npm is included in nodejs package from nodesource

# Verify Installations
python3 --version
node --version
npm --version
nginx -v

# Setup Backend Virtual Environment
echo "Setting up backend..."
cd "$PROJECT_ROOT/backend" || { echo "Backend directory not found"; exit 1; }
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Setup Database
# Using the provided script, but skipping if no images (assuming images might be uploaded manually later or pulled)
# For now just running it to ensure DB is created
if [ -f "populate_db.py" ]; then
    python3 populate_db.py
else
    echo "Warning: populate_db.py not found in backend directory"
fi

# Setup Frontend
echo "Setting up frontend..."
cd "$PROJECT_ROOT/frontend" || { echo "Frontend directory not found"; exit 1; }
npm install
npm run build

# Configure Nginx
echo "Configuring Nginx..."
# We need to update the nginx.conf to point to the correct root
sed -i "s|/home/ubuntu/Evaluacion-Expertos-Retina|$PROJECT_ROOT|g" "$PROJECT_ROOT/nginx.conf"

sudo cp "$PROJECT_ROOT/nginx.conf" /etc/nginx/sites-available/retina
sudo ln -sf /etc/nginx/sites-available/retina /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# FIX PERMISSIONS: Ensure Nginx (www-data) can read the files
echo "Fixing permissions for Nginx..."
sudo chmod 755 /home/ubuntu
sudo chmod 755 "$PROJECT_ROOT"
# Recursively allow read/execute for others on the project
sudo chmod -R o+rx "$PROJECT_ROOT"
# Give ownership of dist to ubuntu but keep it readable
sudo chown -R ubuntu:ubuntu "$PROJECT_ROOT"

sudo systemctl restart nginx

# Setup System Service for Backend (Gunicorn)
echo "Creating systemd service for backend..."
sudo bash -c "cat > /etc/systemd/system/retina-backend.service <<EOF
[Unit]
Description=Gunicorn instance to serve Retina Evaluation Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=$PROJECT_ROOT/backend
Environment=\"PATH=$PROJECT_ROOT/backend/venv/bin\"
ExecStart=$PROJECT_ROOT/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
EOF"

echo "Starting backend service..."
sudo systemctl daemon-reload
sudo systemctl start retina-backend
sudo systemctl enable retina-backend
sudo systemctl restart retina-backend

echo "Setup Complete! Visit your Public IP to see the site."
