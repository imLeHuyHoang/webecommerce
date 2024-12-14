#!/bin/bash
# start_application.sh

set -e  # Dừng script nếu có lỗi xảy ra


# Khởi động lại các container với cấu hình mới
echo "Starting Docker containers..."
docker-compose up -d

echo "Application started successfully."
