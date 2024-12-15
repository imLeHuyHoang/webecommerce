# Giai đoạn build
FROM node:20-alpine AS build_image

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]