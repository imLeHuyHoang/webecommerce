#!/bin/bash
# start_application.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Starting application..."


APP_DIR="/home/ec2-user/myapp"

echo "Navigating to application directory: $APP_DIR"
cd $APP_DIR

docker-compose down

docker-compose up -d

echo "Application started successfully."
