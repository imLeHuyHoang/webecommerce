FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g pm2 
COPY . .
EXPOSE 5000
CMD ["pm2","start", "index.js"]
