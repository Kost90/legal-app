# Base image
# FROM node:20-alpine AS base

# WORKDIR /app

# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# EXPOSE 3030

# CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]

# Используем официальный образ Puppeteer с Node, Chromium и нужными зависимостями
FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

# Копируем зависимости и устанавливаем
COPY package*.json ./
RUN npm install --omit=dev

# Копируем остальной код и билдим
COPY . .
RUN npm run build

# Указываем порт
EXPOSE 3030

# Запуск миграций и сервера
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]