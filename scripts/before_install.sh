#!/bin/bash
# before_install.sh

set -e

echo "Running BeforeInstall hooks..."



# Kiểm tra và cài đặt Git nếu chưa có
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

# Tạo thư mục ứng dụng nếu chưa tồn tại
APP_DIR="/home/ec2-user/myapp"
if [ ! -d "$APP_DIR" ]; then
    echo "Creating application directory: $APP_DIR"
    mkdir -p $APP_DIR
fi

# Thay đổi quyền sở hữu thư mục ứng dụng
sudo chown -R ec2-user:ec2-user $APP_DIR

cd /home/ec2-user
wget https://aws-codedeploy-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/latest/install
sudo chmod +x ./install
sudo ./install auto
sudo systemctl start codedeploy-agent
sudo systemctl enable codedeploy-agent

echo "BeforeInstall hooks completed successfully."