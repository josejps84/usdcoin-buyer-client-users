# Etapa 1: Compilación de la App
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servidor de Producción Ligero con Nginx
FROM nginx:stable-alpine
# Copiar los archivos estáticos compilados por Vite
COPY --from=builder /app/dist /usr/share/nginx/html
# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
