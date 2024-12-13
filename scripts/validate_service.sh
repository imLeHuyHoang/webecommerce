#!/bin/bash
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

# Kiểm tra HTTP response từ backend
echo "Checking if the backend is responding..."
BACKEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q --filter "name=backend"))
curl --silent --max-time 10 http://$BACKEND_IP:5000/health || (echo "Backend is not responding correctly!" && exit 1)

# Kiểm tra logs của frontend
echo "Checking frontend service logs..."
docker-compose logs frontend
if [ $? -ne 0 ]; then
    echo "Error in frontend container logs!"
    exit 1
fi

# Kiểm tra HTTP response từ frontend
echo "Checking if the frontend is responding..."
FRONTEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $(docker ps -q --filter "name=frontend"))
curl --silent --max-time 10 http://$FRONTEND_IP:5173 || (echo "Frontend is not responding correctly!" && exit 1)
echo "Service validation completed successfully."
