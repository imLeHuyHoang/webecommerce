#!/bin/bash
set -e

echo "Đang xây dựng và triển khai Docker containers..."

# Chuyển đến thư mục ứng dụng
cd /home/ec2-user/myapp

# Dừng các container hiện tại nếu đang chạy
docker-compose down || true

# Xây dựng lại các Docker image
docker-compose build

# Khởi động các container mới
docker-compose up -d

echo "Triển khai Docker containers hoàn tất."
