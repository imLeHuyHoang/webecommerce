#!/bin/bash
# validate_service.sh
echo "Validating service..."

# Kiểm tra trạng thái container
docker ps

# Kiểm tra logs của backend
echo "Checking backend service logs..."
docker-compose logs backend


# Kiểm tra logs của frontend
echo "Checking frontend service logs..."
docker-compose logs frontend


echo "Service validation completed successfully."
