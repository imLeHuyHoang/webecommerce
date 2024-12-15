# Giai đoạn build
FROM node:22-alpine AS build_image

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Giai đoạn sản xuất
FROM node:22-alpine AS production_image

WORKDIR /app

# Sao chép thư mục dist từ build_image
COPY --from=build_image /app/dist/ /app/dist/

# Cài đặt serve để phục vụ các tệp tĩnh
RUN npm install -g serve

# Mở cổng 5173
EXPOSE 5173

# Khởi động ứng dụng bằng lệnh "serve"
CMD ["serve", "-s", "dist", "-l", "5173"]