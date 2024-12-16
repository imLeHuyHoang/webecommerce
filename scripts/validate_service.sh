#!/bin/bash
# validate_service.sh

set -e

echo "Validating service..."

APP_DIR="/home/ec2-user/myapp"
cd $APP_DIR

docker ps

echo "Service validation completed successfully."
