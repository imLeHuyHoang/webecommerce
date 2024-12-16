#!/bin/bash
# before_install.sh

set -e  # Dừng script nếu có lỗi

echo "Running BeforeInstall hooks..."

# Cài đặt Git nếu chưa có
if ! command -v git &> /dev/null
then
    echo "Git not found. Installing Git..."
    sudo yum update -y
    sudo yum install git -y
    echo "Git installed successfully."
else
    echo "Git is already installed."
fi

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
    DOCKER_COMPOSE_VERSION="1.29.2"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
     -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully."
else
    echo "Docker Compose is already installed."
fi

# Kiểm tra phiên bản
docker --version
docker-compose --version
sudo chown -R ec2-user:ec2-user /home/ec2-user/myapp/
sudo chmod -R u+rw /home/ec2-user/myapp/
rm -rf /home/ec2-user/myapp/*

echo "BeforeInstall hooks completed successfully."
