#!/bin/bash
# start_application.sh

set -e

echo "Starting application..."

APP_DIR="/home/ec2-user/myapp"
cd $APP_DIR

echo "Stopping existing containers (if any)..."
docker-compose down || true

echo "Building and starting containers..."
docker-compose up -d --build

echo "Checking Docker containers status..."
docker ps -a

echo "Application started successfully."
