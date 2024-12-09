# Stage 1: Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production stage (Nginx)
FROM nginx:alpine
# Copy static files từ build stage sang Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Xóa default config và copy file nginx.conf custom
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
