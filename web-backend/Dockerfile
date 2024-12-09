FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pm2 && npm install
COPY . .
EXPOSE 5000
CMD ["pm2-runtime", "node", "index.js"]
