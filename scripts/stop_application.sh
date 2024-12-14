#!/bin/bash
# stop_application.sh
echo "Running ApplicationStop hooks..."

# Kiểm tra và cài đặt CodeDeploy Agent nếu chưa có
if ! systemctl is-active --quiet codedeploy-agent; then
    echo "CodeDeploy Agent is not running. Installing..."
    sudo service codedeploy-agent start
    if [ $? -ne 0 ]; then
        echo "Failed to start CodeDeploy Agent!"
        exit 1
    fi
fi

echo "CodeDeploy Agent is running."

# Dừng các dịch vụ Docker nếu đang chạy
echo "Stopping existing Docker containers..."
sudo systemctl stop docker || true
