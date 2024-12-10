# Sử dụng image Node.js ổn định
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json (nếu có) vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

COPY . .
EXPOSE 5173

CMD ["npm", "run", "start"]
