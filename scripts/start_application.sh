#!/bin/bash
# start_application.sh

echo "Starting application..."

# Thiết lập thư mục ứng dụng
APP_DIR="/home/ec2-user/myapp"

# Thư mục chứa backend và frontend
BACKEND_DIR="$APP_DIR/web-backend"
FRONTEND_DIR="$APP_DIR/web-frontend"


# Lấy file .env cho backend từ Parameter Store
echo "Retrieving backend .env from Parameter Store..."
aws ssm get-parameter \
  --name "/myapp/web-backend/.env" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text > $BACKEND_DIR/.env


# Lấy file .env cho frontend từ Parameter Store
echo "Retrieving frontend .env from Parameter Store..."
aws ssm get-parameter \
  --name "/myapp/web-frontend/.env" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text > $FRONTEND_DIR/.env



echo "Environment files created successfully."

# Dừng các container hiện tại nếu có
echo "Stopping existing Docker containers..."
docker-compose down || true

# Khởi động lại các container với cấu hình mới
echo "Starting Docker containers..."
docker-compose up -d

echo "Application started successfully."
