# ---------- 1) deps: ставим ВСЕ зависимости для кэша ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# Puppeteer не скачивает Chromium на этом этапе
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package*.json ./
RUN npm install

# ---------- 2) builder: собираем Nest в /dist ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- 3) runner: Финальный образ ----------
FROM ghcr.io/puppeteer/puppeteer:latest

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости от root (важно для прав записи)
USER root
RUN chown -R pptruser:pptruser /app && npm install

ENV NODE_ENV=production

# Копируем package.json и ставим только production-зависимости
COPY package*.json ./
RUN npm install --omit=dev

# Копируем собранный NestJS код
COPY --from=builder /app/dist ./dist

# Копируем entrypoint.sh и настраиваем права
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && chown -R pptruser:pptruser /app

USER pptruser
EXPOSE 3030

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
