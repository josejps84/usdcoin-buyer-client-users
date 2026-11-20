# Stage 1: build the app
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite inlines these at build time
ARG VITE_API_HOST=http://localhost
ARG VITE_API_PORT=9000
ENV VITE_API_HOST=$VITE_API_HOST VITE_API_PORT=$VITE_API_PORT
RUN npm run build

# Stage 2: serve the static files with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
