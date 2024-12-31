#!/bin/bash
# stop_application.sh

set -e

echo "Stopping application..."

docker-compose down || true

echo "ApplicationStop hooks completed successfully."
