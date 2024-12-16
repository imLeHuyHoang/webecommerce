FROM node:20-alpine

WORKDIR /app

# Sao chép file package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ra folder dist
RUN npm run build

# Chạy serve production bằng vite preview
EXPOSE 5173
CMD ["npm", "run", "start"]
