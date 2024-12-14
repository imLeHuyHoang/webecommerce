#!/bin/bash
# before_install.sh
echo "Running BeforeInstall hooks..."

# Cài đặt Docker nếu chưa có

echo "Docker not found. Installing Docker..."
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user


docker --version

echo "Docker Compose not found. Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose


docker-compose --version
