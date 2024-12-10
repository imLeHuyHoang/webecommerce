# nginx/Dockerfile

FROM nginx:stable-alpine

# Xóa cấu hình mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy cấu hình tùy chỉnh vào container
COPY nginx.conf /etc/nginx/nginx.conf

# Expose cổng 80
EXPOSE 80
