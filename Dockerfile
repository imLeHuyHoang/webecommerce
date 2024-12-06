# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Sao chép và cài đặt dependencies cho frontend
COPY web-frontend/package*.json ./
RUN npm install

# Sao chép mã nguồn frontend và xây dựng ứng dụng
COPY web-frontend/. .
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Sao chép và cài đặt dependencies cho backend
COPY web-backend/package*.json ./
RUN npm install

# Sao chép mã nguồn backend và cài đặt nodemon
COPY web-backend/. .
RUN npm install -g nodemon

# Stage 3: Final Frontend Image
FROM node:20-alpine AS frontend

WORKDIR /app/frontend

# Sao chép build frontend từ stage frontend-build
COPY --from=frontend-build /app/frontend/dist ./dist

# Expose cổng frontend dev (Vite dev server)
EXPOSE 5173

# Chạy Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 4: Final Backend Image
FROM node:20-alpine AS backend

WORKDIR /app/backend

# Sao chép build backend từ stage backend-build
COPY --from=backend-build /app/backend/dist ./dist

# Expose cổng backend
EXPOSE 5000

# Lệnh khởi chạy: sử dụng nodemon, giám sát file
CMD ["nodemon", "index.js"]
