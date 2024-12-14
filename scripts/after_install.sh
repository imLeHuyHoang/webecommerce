#!/bin/bash
# after_install.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Running AfterInstall hooks..."

# Kiểm tra Docker daemon
echo "Starting Docker daemon..."
sudo systemctl start docker
sudo systemctl status docker

# Đăng nhập vào Amazon ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 654654447255.dkr.ecr.ap-southeast-1.amazonaws.com
if [ $? -ne 0 ]; then
    echo "ECR login failed!"
    exit 1
fi

# Kiểm tra thư mục ứng dụng
APP_DIR="/home/ec2-user/myapp"
echo "Navigating to application directory: $APP_DIR"
cd $APP_DIR
if [ ! -f "docker-compose.yml" ]; then
    echo "docker-compose.yml not found in $APP_DIR!"
    exit 1
fi

# Tạo các file .env từ Parameter Store
echo "Retrieving environment variables from Parameter Store..."

# Thư mục chứa backend và frontend
BACKEND_DIR="$APP_DIR/web-backend"
FRONTEND_DIR="$APP_DIR/web-frontend"

# Tạo các thư mục nếu chưa tồn tại
mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR

# Lấy file .env cho backend từ Parameter Store
echo "Retrieving backend .env from Parameter Store..."
aws ssm get-parameter \
  --name "/myapp/web-backend/.env" \
  --with-decryption \
  --region ap-southeast-1 \
  --query "Parameter.Value" \
  --output text > $BACKEND_DIR/.env

if [ $? -ne 0 ]; then
    echo "Failed to retrieve /myapp/web-backend/.env from Parameter Store."
    exit 1
fi

# Lấy file .env cho frontend từ Parameter Store
echo "Retrieving frontend .env from Parameter Store..."
aws ssm get-parameter \
  --name "/myapp/web-frontend/.env" \
  --with-decryption \
  --region ap-southeast-1 \
  --query "Parameter.Value" \
  --output text > $FRONTEND_DIR/.env

if [ $? -ne 0 ]; then
    echo "Failed to retrieve /myapp/web-frontend/.env from Parameter Store."
    exit 1
fi

echo "Environment files created successfully."

# Kéo Docker images từ ECR
echo "Pulling Docker images..."
docker-compose pull
if [ $? -ne 0 ]; then
    echo "Failed to pull Docker images."
    exit 1
fi

# Dừng các container đang chạy (nếu có) và khởi động lại
echo "Stopping existing containers..."
docker-compose down || true

echo "AfterInstall hooks completed successfully."
