FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g pm2

COPY . .
EXPOSE 5000

# Dùng pm2-runtime thay vì pm2 start
CMD ["pm2-runtime","index.js"]
