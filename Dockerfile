# Base image
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3030

CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]