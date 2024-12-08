FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build ra static file
RUN npm run build

# Cài đặt serve (hoặc bạn dùng Nginx)
RUN npm install -g serve

# Expose port 5173 hoặc 80 tùy ý
EXPOSE 5173

# Dùng serve để phục vụ static file ở thư mục dist
CMD ["serve", "-s", "dist", "-l", "5173"]
