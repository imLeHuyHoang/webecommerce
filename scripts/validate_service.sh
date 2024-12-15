#!/bin/bash
# validate_service.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Validating service..."

APP_DIR="/home/ec2-user/myapp"

echo "Navigating to application directory: $APP_DIR"
cd $APP_DIR

# Kiểm tra trạng thái container
echo "Checking Docker containers status..."
docker ps

echo "Service validation completed successfully."
