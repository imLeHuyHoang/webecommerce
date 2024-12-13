#!/bin/bash
echo "Running AfterInstall hooks..."

# Khởi động Docker daemon nếu cần
echo "Starting Docker service..."
sudo systemctl start docker

# Kiểm tra xem Docker daemon có chạy hay không
sudo systemctl status docker
if [ $? -ne 0 ]; then
    echo "Docker service failed to start!"
    exit 1
fi

# Cài đặt Docker Compose nếu chưa có
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose not found. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Kiểm tra xem Docker Compose đã được cài đặt chưa
docker-compose --version
if [ $? -ne 0 ]; then
    echo "Docker Compose installation failed!"
    exit 1
fi
