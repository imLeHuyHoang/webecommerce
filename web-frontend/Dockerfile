FROM node:20-alpine

WORKDIR /app

# Sao chép file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Cài đặt công cụ `serve` để chạy production
RUN npm install -g serve

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ra folder dist
RUN npm run build

# Chạy serve để phục vụ thư mục dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
