# Usar la imagen oficial de Node.js 22
FROM node:22-alpine

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de pnpm
COPY package.json pnpm-lock.yaml .npmrc ./

# Instalar dependencias usando pnpm
RUN pnpm install

# Copiar las variables de entorno
#COPY .env.local .env.local

# Copiar el resto de los archivos
COPY . .

# Instalar dependencias y construir la aplicación
RUN pnpm build

# Puerto de exposición
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["pnpm", "start"]