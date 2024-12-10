# Sử dụng image Node.js ổn định
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json (nếu có) vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Cài đặt PM2 toàn cầu
RUN npm install -g pm2

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Xây dựng ứng dụng (nếu cần, ví dụ cho React, Vue, ... )
# RUN npm run build

# Mở cổng mà ứng dụng sẽ chạy
EXPOSE 5173

# Khởi chạy ứng dụng bằng PM2
CMD ["pm2-runtime", "npm", "--", "run", "start"]
