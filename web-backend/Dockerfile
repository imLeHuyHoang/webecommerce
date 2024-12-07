FROM node:18-alpine

WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm install

# Sao chép mã nguồn
COPY . .

# Cài nodemon toàn cục (không bắt buộc nếu bạn đã cài local)
RUN npm install -g nodemon

# Expose cổng backend
EXPOSE 5000

# Lệnh khởi chạy: sử dụng nodemon, giám sát file
CMD ["nodemon", "index.js"]
