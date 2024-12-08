FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build ra static file
RUN npm run build


# Expose port 5173 hoặc 80 tùy ý
EXPOSE 5173

# Dùng serve để phục vụ static file ở thư mục dist
CMD ["npm", "run", "dev"]