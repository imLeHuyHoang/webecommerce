# web-frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies (npm ci nếu có package-lock.json)
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ra dist
RUN npm run build

# Cài đặt serve
RUN npm install -g serve

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
