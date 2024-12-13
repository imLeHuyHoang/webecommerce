#!/bin/bash
echo "Running AfterInstall hooks..."

# Khởi động Docker daemon nếu cần
echo "Starting Docker service..."
sudo systemctl start docker

# Kiểm tra xem Docker daemon có chạy hay không
sudo systemctl status docker
if [ $? -ne 0 ]; then
    echo "Docker service failed to start!"
    exit 1
fi

# Cài đặt Docker nếu chưa có
if ! command -v docker &> /dev/null
then
    echo "Docker not found. Installing Docker..."
    sudo yum update -y
    sudo amazon-linux-extras install docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi

# Kiểm tra xem Docker đã được cài đặt chưa
docker --version
if [ $? -ne 0 ]; then
    echo "Docker installation failed!"
    exit 1
fi

# Cài đặt Docker Compose nếu chưa có
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose not found. Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Kiểm tra xem Docker Compose đã được cài đặt chưa
docker-compose --version
if [ $? -ne 0 ]; then
    echo "Docker Compose installation failed!"
    exit 1
fi

# Cài đặt CodeDeploy Agent nếu chưa có
echo "Checking if CodeDeploy Agent is installed..."

# Kiểm tra xem CodeDeploy agent có sẵn không
if ! command -v codedeploy-agent &> /dev/null
then
    echo "CodeDeploy Agent not found. Installing CodeDeploy Agent..."

    # Cài đặt CodeDeploy agent trên Amazon Linux
    sudo yum install -y ruby
    cd /home/ec2-user
    curl -O https://github.com/aws/aws-codedeploy-agent/releases/download/latest/aws-codedeploy-agent-ubuntu-x64-1.0.0.deb
    sudo dpkg -i aws-codedeploy-agent-ubuntu-x64-1.0.0.deb

    # Cài đặt và bắt đầu CodeDeploy agent
    sudo service codedeploy-agent start

    # Kiểm tra xem CodeDeploy agent đã chạy chưa
    sudo service codedeploy-agent status
    if [ $? -ne 0 ]; then
        echo "CodeDeploy Agent failed to start!"
        exit 1
    fi
else
    echo "CodeDeploy Agent is already installed."
fi

echo "All services installed and running successfully."
