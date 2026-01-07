#!/bin/bash

# Update System
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Dependencies
echo "Installing dependencies..."
sudo apt install -y python3-pip python3-venv nodejs npm nginx git acl

# Verify Installations
python3 --version
node --version
npm --version
nginx -v

# Setup Backend Virtual Environment
echo "Setting up backend..."
cd ~/Evaluacion-Expertos-Retina/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Setup Database
# Using the provided script, but skipping if no images (assuming images might be uploaded manually later or pulled)
# For now just running it to ensure DB is created
python3 populate_db.py

# Setup Frontend
echo "Setting up frontend..."
cd ~/Evaluacion-Expertos-Retina/frontend
npm install
npm run build

# Configure Nginx
echo "Configuring Nginx..."
sudo cp ~/Evaluacion-Expertos-Retina/nginx.conf /etc/nginx/sites-available/retina
sudo ln -s /etc/nginx/sites-available/retina /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# Setup System Service for Backend (Gunicorn)
echo "Creating systemd service for backend..."
sudo bash -c 'cat > /etc/systemd/system/retina-backend.service <<EOF
[Unit]
Description=Gunicorn instance to serve Retina Evaluation Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/Evaluacion-Expertos-Retina/backend
Environment="PATH=/home/ubuntu/Evaluacion-Expertos-Retina/backend/venv/bin"
ExecStart=/home/ubuntu/Evaluacion-Expertos-Retina/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
EOF'

echo "Starting backend service..."
sudo systemctl start retina-backend
sudo systemctl enable retina-backend

echo "Setup Complete! Visit your Public IP to see the site."
