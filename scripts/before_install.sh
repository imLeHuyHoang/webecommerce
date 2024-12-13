#!/bin/bash
echo "Running BeforeInstall hooks..."

# Dừng dịch vụ hiện tại nếu có
sudo systemctl stop myapp || true

# Kiểm tra Docker daemon có đang chạy không
echo "Checking if Docker service is running..."
sudo systemctl status docker || (echo "Docker is not running. Starting Docker service..." && sudo systemctl start docker)

# Kiểm tra trạng thái Docker daemon
sudo systemctl status docker
