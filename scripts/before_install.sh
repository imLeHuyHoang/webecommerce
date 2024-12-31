#!/bin/bash
# before_install.sh

set -e

echo "Chạy các hooks BeforeInstall..."

# Kiểm tra và cài đặt Git nếu chưa có
if ! command -v git &> /dev/null
then
    echo "Không tìm thấy Git. Đang cài đặt Git..."
    sudo yum update -y
    sudo yum install git -y
    echo "Cài đặt Git thành công."
else
    echo "Git đã được cài đặt."
fi

# Kiểm tra và cài đặt Docker nếu chưa có
if ! command -v docker &> /dev/null
then
    echo "Không tìm thấy Docker. Đang cài đặt Docker..."
    sudo yum update -y
    sudo amazon-linux-extras install docker -y
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
    echo "Cài đặt Docker thành công."
else
    echo "Docker đã được cài đặt."
fi

# Kiểm tra và cài đặt Docker Compose nếu chưa có
if ! command -v docker-compose &> /dev/null
then
    echo "Không tìm thấy Docker Compose. Đang cài đặt Docker Compose..."
    DOCKER_COMPOSE_VERSION="1.29.2"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
     -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Cài đặt Docker Compose thành công."
else
    echo "Docker Compose đã được cài đặt."
fi

# Kiểm tra phiên bản Docker và Docker Compose
docker --version
docker-compose --version

# Định nghĩa thư mục ứng dụng
APP_DIR="/home/ec2-user/myapp"

# Kiểm tra và xóa thư mục ứng dụng hiện có
echo "Kiểm tra xem thư mục ứng dụng có tồn tại tại $APP_DIR không"
if [ -d "$APP_DIR" ]; then
    echo "Thư mục ứng dụng tồn tại. Đang xóa."
    sudo rm -rf "$APP_DIR"
    if [ $? -ne 0 ]; then 
        echo "Không thể xóa thư mục ứng dụng hiện có: $APP_DIR"
        exit 1
    fi
    echo "Xóa thư mục ứng dụng hiện có thành công."
fi

# Tạo lại thư mục ứng dụng
echo "Tạo thư mục ứng dụng: $APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown ec2-user:ec2-user "$APP_DIR"

# Đảm bảo quyền truy cập đúng 
sudo chown -R ec2-user:ec2-user "$APP_DIR"

echo "Hoàn thành các hooks BeforeInstall thành công."
