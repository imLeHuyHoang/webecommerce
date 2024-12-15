#!/bin/bash
# stop_application.sh

set -e  # Dừng script nếu có lỗi xảy ra

echo "Running ApplicationStop hooks..."

# Kiểm tra và cài đặt CodeDeploy Agent nếu chưa có
if ! systemctl is-active --quiet codedeploy-agent; then
    echo "CodeDeploy Agent is not running. Installing and starting CodeDeploy Agent..."
    sudo yum update -y
    sudo yum install -y ruby wget
    cd /home/ec2-user
    wget https://aws-codedeploy-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/latest/install
    chmod +x ./install
    sudo ./install auto
    sudo systemctl start codedeploy-agent
    sudo systemctl enable codedeploy-agent
    if [ $? -ne 0 ]; then
        echo "Failed to install or start CodeDeploy Agent!"
        exit 1
    fi
else
    echo "CodeDeploy Agent is already running."
fi

# Dừng các container đang chạy (nếu có)
echo "Stopping existing Docker containers..."
docker-compose down || true


echo "ApplicationStop hooks completed successfully."
