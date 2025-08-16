# ---------- 1) base-deps: ставим все зависимости для сборки ----------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# Чтобы не качать Chromium в этапах сборки:
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package*.json ./
# ИСПРАВЛЕНО: Используем npm install для большей надежности
RUN npm install

# ---------- 2) builder: собираем Nest в dist ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Собираем NestJS
RUN npm run build

# ---------- 3) prune: только прод-зависимости ----------
FROM node:20-bookworm-slim AS prune
WORKDIR /app
COPY package*.json ./
# ИСПРАВЛЕНО: Используем npm install для большей надежности
RUN npm install --omit=dev

# ---------- 4) runner: puppeteer runtime с Chromium ----------
FROM ghcr.io/puppeteer/puppeteer:latest AS runner
# База уже содержит Chromium и пользователя pptruser
WORKDIR /app
# Полезные утилиты: init и ожидание БД
USER root
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Подсказываем puppeteer путь к Chromium и отключаем загрузку
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
# Если код не передает флаги браузеру, можно читать их из переменной:
ENV PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox --font-render-hinting=none"

# Копируем собранный код и прод-зависимости
COPY --from=prune /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Скрипт entrypoint: ждём БД, гоняем миграции, стартуем
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && chown -R pptruser:pptruser /app

USER pptruser
EXPOSE 3030

# В package.json должен быть "start:prod": "node dist/main.js"
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/entrypoint.sh"]
