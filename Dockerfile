# Використовує Next.js standalone output (next.config.ts) — мінімальний
# runtime-образ без зайвого node_modules. Prisma тут працює через driver
# adapter (@prisma/adapter-pg) без нативного бінарного engine, тож жодних
# спеціальних кроків для Prisma не потрібно.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Потрібне лише як валідний рядок під час білду (Prisma-клієнт
# інстанціюється при завантаженні модуля, але з'єднання лінива —
# реального підключення до БД під час build не відбувається).
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Каталог для завантажених фото (lib/storage.ts) — монтується як volume
# у docker-compose.yml, щоб дані переживали перестворення контейнера.
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
