#!/bin/bash
# after_install.sh

set -e

echo "Running AfterInstall hooks..."

# Đảm bảo Docker chạy
echo "Starting Docker daemon..."
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl status docker

APP_DIR="/home/ec2-user/myapp"
echo "Navigating to application directory: $APP_DIR"
cd $APP_DIR
if [ ! -f "docker-compose.yml" ]; then
    echo "docker-compose.yml not found!"
    exit 1
fi

# Lấy file .env từ Parameter Store (SSM)
echo "Retrieving environment variables from Parameter Store..."
BACKEND_DIR="$APP_DIR/web-backend"
FRONTEND_DIR="$APP_DIR/web-frontend"

mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR

# Backend .env
echo "Retrieving backend .env"
aws ssm get-parameter \
  --name "/myapp/web-backend/.env" \
  --with-decryption \
  --region ap-southeast-1 \
  --query "Parameter.Value" \
  --output text > $BACKEND_DIR/.env

if [ $? -ne 0 ]; then
    echo "Failed to retrieve backend .env"
    exit 1
fi

# Frontend .env
echo "Retrieving frontend .env"
aws ssm get-parameter \
  --name "/myapp/web-frontend/.env" \
  --with-decryption \
  --region ap-southeast-1 \
  --query "Parameter.Value" \
  --output text > $FRONTEND_DIR/.env

if [ $? -ne 0 ]; then
    echo "Failed to retrieve frontend .env"
    exit 1
fi

echo "Environment files created successfully."

# Dọn dẹp Docker
echo "Cleaning up Docker resources..."
docker system prune -a --volumes -f
echo "Docker resources cleaned up successfully."

echo "AfterInstall hooks completed successfully."
