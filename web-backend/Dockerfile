# Sử dụng Node.js phiên bản 18-alpine làm base image
FROM node:20-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt PM2 toàn cầu và các phụ thuộc của ứng dụng
RUN npm install -g pm2 && npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .


# Expose cổng backend
EXPOSE 5000

# Thiết lập biến môi trường NODE_ENV thành production
ENV NODE_ENV=production

# Khởi động ứng dụng bằng PM2
CMD ["pm2-runtime", "start", "index.js"]
