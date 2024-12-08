# Sử dụng Node.js phiên bản 18-alpine làm base image
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Build ra static file (nếu cần)
RUN npm run build

# Expose cổng frontend
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
