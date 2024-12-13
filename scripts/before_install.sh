
echo "Running BeforeInstall hooks..."

# Dừng dịch vụ hiện tại nếu có
sudo systemctl stop myapp || true


echo "Checking if Docker service is running..."
sudo systemctl status docker || (echo "Docker is not running. Starting Docker service..." && sudo systemctl start docker)

sudo systemctl status docker
