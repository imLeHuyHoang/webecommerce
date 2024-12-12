#!/bin/bash
echo "Validating service..."
# Kiểm tra xem ứng dụng đã chạy đúng chưa, ví dụ kiểm tra HTTP response
curl -f http://localhost:5000 || exit 1
curl -f http://localhost:5173 || exit 1
