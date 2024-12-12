#!/bin/bash
echo "Running BeforeInstall hooks..."
# Thêm các lệnh cần thiết ở đây, ví dụ: dừng dịch vụ hiện tại
sudo systemctl stop myapp || true
