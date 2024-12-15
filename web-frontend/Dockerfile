# Sử dụng Node.js phiên bản 22 trên Alpine Linux
FROM node:22-alpine

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn ứng dụng
COPY . .

# Build ứng dụng
RUN npm run build

# Cài đặt serve để phục vụ các tệp tĩnh
RUN npm install -g serve

# Mở cổng mà ứng dụng sẽ chạy (cổng 5173)
EXPOSE 5173

# Khởi động ứng dụng sử dụng script "start"
CMD ["npm", "start"]
