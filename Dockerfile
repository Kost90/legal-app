
FROM node:20-bookworm-slim AS deps
WORKDIR /app
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package*.json ./
RUN npm install

FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS prune
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev


FROM ghcr.io/puppeteer/puppeteer:latest AS runner
WORKDIR /app
USER root
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox --font-render-hinting=none"

COPY --from=prune /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && chown -R pptruser:pptruser /app

USER pptruser
EXPOSE 3030

# В package.json должен быть "start:prod": "node dist/main.js"
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["/app/entrypoint.sh"]