#!/bin/bash
# start_application.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Starting application..."

# Thiết lập thư mục ứng dụng
APP_DIR="/home/ec2-user/myapp"

# Chuyển đến thư mục ứng dụng
echo "Navigating to application directory: $APP_DIR"
cd $APP_DIR

# Khởi động lại các container với cấu hình mới
echo "Starting Docker containers..."
docker-compose down
docker-compose up --build

echo "Application started successfully."
