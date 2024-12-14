#!/bin/bash
# after_install.sh
echo "Running AfterInstall hooks..."

# Kiểm tra Docker daemon
sudo systemctl start docker
sudo systemctl status docker

echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 654654447255.dkr.ecr.ap-southeast-1.amazonaws.com
if [ $? -ne 0 ]; then
    echo "ECR login failed!"
    exit 1
fi

# Kiểm tra thư mục ứng dụng
cd /home/ec2-user/myapp
if [ ! -f "docker-compose.yml" ]; then
    echo "docker-compose.yml not found!"
    exit 1
fi

# Kéo Docker images từ ECR
echo "Pulling Docker images..."
docker-compose pull
if [ $? -ne 0 ]; then
    echo "Failed to pull Docker images."
    exit 1
fi

# Dừng các container đang chạy (nếu có) và khởi động lại
echo "Stopping existing containers and starting new ones..."
docker-compose down || true
