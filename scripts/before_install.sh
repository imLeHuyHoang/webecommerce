#!/bin/bash
# before_install.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Running BeforeInstall hooks..."

# Kiểm tra và cài đặt Docker nếu chưa có
if ! command -v docker &> /dev/null
then
    echo "Docker not found. Installing Docker..."
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
    echo "Docker installed successfully."
else
    echo "Docker is already installed."
fi

# Kiểm tra và cài đặt Docker Compose nếu chưa có
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose not found. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully."
else
    echo "Docker Compose is already installed."
fi

# Kiểm tra phiên bản Docker và Docker Compose
docker --version
docker-compose --version

echo "BeforeInstall hooks completed successfully."
