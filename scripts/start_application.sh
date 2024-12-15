#!/bin/bash
# start_application.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Starting application..."

APP_DIR="/home/ec2-user/myapp"

echo "Navigating to application directory: $APP_DIR"
cd $APP_DIR

echo "Stopping existing Docker containers..."
docker-compose down

echo "Starting Docker containers in detached mode..."
docker-compose up -d 

# **Thêm bước kiểm tra trạng thái các container sau khi khởi động**
echo "Checking Docker containers status..."
docker ps -a

echo "Application started successfully."
