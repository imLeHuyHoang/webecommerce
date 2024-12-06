FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose cổng frontend dev (Vite dev server)
EXPOSE 5173

# Chạy vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
