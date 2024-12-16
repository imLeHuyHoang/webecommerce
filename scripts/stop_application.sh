#!/bin/bash
# stop_application.sh

set -e

echo "Stopping application..."

# Dừng container
docker-compose down || true

echo "ApplicationStop hooks completed successfully."
