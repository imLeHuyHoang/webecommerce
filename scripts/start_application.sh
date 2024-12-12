#!/bin/bash
echo "Starting application..."
cd /home/ec2-user/myapp
docker-compose down || true
docker-compose up -d --build
