FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Lúc chạy container, serve build production
CMD ["npm","run","start"]
