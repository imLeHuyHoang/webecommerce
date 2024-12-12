#!/bin/bash
echo "Running AfterInstall hooks..."
# Khởi động Docker daemon nếu cần
sudo service docker start

# Cài đặt Docker Compose nếu chưa có
if ! command -v docker-compose &> /dev/null
then
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi
