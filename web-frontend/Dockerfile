FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build  # Build ra folder dist

# Cài đặt serve để serve static build (hoặc dùng npx vite preview)
RUN npm install -g serve

# Lúc chạy container, serve build production
CMD ["serve", "-s", "dist", "-l", "5173"]
