#!/bin/bash
# start_application.sh
echo "Starting application..."

docker-compose down || true

docker-compose up -d

echo "Application started successfully."
