#!/bin/bash
# after_install.sh

set -e

echo "Chạy các hooks AfterInstall..."

# Đảm bảo Docker đang chạy
echo "Khởi động Docker daemon..."
sudo systemctl start docker
sudo systemctl enable docker
sudo systemctl status docker

APP_DIR="/home/ec2-user/myapp"
echo "Điều hướng đến thư mục ứng dụng: $APP_DIR"
cd $APP_DIR

if [ ! -f "docker-compose.yml" ]; then
    echo "Không tìm thấy docker-compose.yml!"
    exit 1
fi

# Lấy file .env từ Parameter Store (SSM)
echo "Lấy các biến môi trường từ Parameter Store..."
BACKEND_DIR="$APP_DIR/web-backend"
FRONTEND_DIR="$APP_DIR/web-frontend"

mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR

# Backend .env
echo "Lấy file .env cho backend"
aws ssm get-parameter \
  --name "/myapp/web-backend/.env" \
  --with-decryption \
  --region ap-southeast-1 \
  --query "Parameter.Value" \
  --output text > $BACKEND_DIR/.env

if [ $? -ne 0 ]; then
    echo "Không thể lấy file .env cho backend"
    exit 1
fi

# Frontend .env
echo "Lấy file .env cho frontend"
aws ssm get-parameter \
  --name "/myapp/web-frontend/.env" \
  --with-decryption \
  --region ap-southeast-1 \
  --query "Parameter.Value" \
  --output text > $FRONTEND_DIR/.env

if [ $? -ne 0 ]; then
    echo "Không thể lấy file .env cho frontend"
    exit 1
fi

echo "Tạo các file môi trường thành công."

# Dọn dẹp Docker
echo "Dọn dẹp các tài nguyên Docker..."
docker system prune -a --volumes -f
echo "Dọn dẹp các tài nguyên Docker thành công."

echo "Hoàn thành các hooks AfterInstall thành công."