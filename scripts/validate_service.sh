#!/bin/bash
# validate_service.sh
echo "Validating service..."

# Kiểm tra trạng thái container
docker ps
if [ $? -ne 0 ]; then
    echo "No running containers found!"
    exit 1
fi

# Kiểm tra logs của backend
echo "Checking backend service logs..."
docker-compose logs backend
if [ $? -ne 0 ]; then
    echo "Error in backend container logs!"
    exit 1
fi

# Kiểm tra logs của frontend
echo "Checking frontend service logs..."
docker-compose logs frontend
if [ $? -ne 0 ]; then
    echo "Error in frontend container logs!"
    exit 1
fi

echo "Service validation completed successfully."
