#!/bin/bash
# start_application.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Starting application..."

# Thiết lập thư mục ứng dụng
APP_DIR="/home/ec2-user/myapp"

# Thư mục chứa backend và frontend
BACKEND_DIR="$APP_DIR/web-backend"
FRONTEND_DIR="$APP_DIR/web-frontend"

# Kiểm tra sự tồn tại của các file .env
if [ ! -f "$BACKEND_DIR/.env" ] || [ ! -f "$FRONTEND_DIR/.env" ]; then
    echo "Environment files not found. Retrieving from Parameter Store..."
    aws ssm get-parameter \
      --name "/myapp/web-backend/.env" \
      --with-decryption \
      --query "Parameter.Value" \
      --output text > $BACKEND_DIR/.env

    aws ssm get-parameter \
      --name "/myapp/web-frontend/.env" \
      --with-decryption \
      --query "Parameter.Value" \
      --output text > $FRONTEND_DIR/.env
    echo "Environment files retrieved successfully."
fi

echo "Environment files verified."

# Khởi động lại các container với cấu hình mới
echo "Starting Docker containers..."
docker-compose up -d

echo "Application started successfully."
