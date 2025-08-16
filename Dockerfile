# ---------- 1) deps: ставим ВСЕ зависимости для кэша ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# Эта переменная нужна, чтобы npm не пытался скачать Chromium на этом этапе
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
# Используем официальный образ Puppeteer, в котором уже есть Chromium
FROM ghcr.io/puppeteer/puppeteer:latest AS runner
WORKDIR /app
USER root
# Устанавливаем утилиты, если они нужны
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Копируем package.json и устанавливаем ТОЛЬКО production-зависимости
# Это ключевое изменение: установка происходит ВНУТРИ правильного образа
COPY package*.json ./
RUN npm install --omit=dev

# Копируем собранный код из этапа builder
COPY --from=builder /app/dist ./dist

# Копируем entrypoint и настраиваем права
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && chown -R pptruser:pptruser /app

USER pptruser
EXPOSE 3030

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/entrypoint.sh"]