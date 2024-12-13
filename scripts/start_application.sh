#!/bin/bash
echo "Starting application..."

# Đăng nhập vào ECR để kéo Docker images
echo "Đăng nhập vào Amazon ECR..."
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 654654447255.dkr.ecr.ap-southeast-1.amazonaws.com

# Kiểm tra đăng nhập thành công
if [ $? -ne 0 ]; then
    echo "Đăng nhập vào ECR thất bại."
    exit 1
fi

# Chuyển đến thư mục ứng dụng
cd /home/ec2-user/myapp

# Kéo Docker images từ ECR
docker-compose down || true
docker-compose pull
docker-compose up -d --build

echo "Application started successfully."
