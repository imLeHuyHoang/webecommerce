# Sử dụng image Node.js ổn định (Lựa chọn Alpine để giảm kích thước image)
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json (nếu có) vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies của ứng dụng
RUN npm install && npm install -g pm2 && npm install -g serve

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng React (tạo thư mục dist/ với các file tĩnh)
RUN npm run build

# Expose cổng để phục vụ ứng dụng React
EXPOSE 5173

# Sử dụng PM2 để phục vụ ứng dụng React
CMD ["pm2", "start", "serve", "--name", "react-app", "--", "-s", "dist", "-l", "5173"]
