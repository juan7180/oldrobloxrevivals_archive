# syntax=docker/dockerfile:1

FROM oven/bun:1.2-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
RUN bun install --frozen-lockfile

FROM oven/bun:1.2-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV APP_ROOT=/app
ENV ARCHIVE_DIR=/app/data/archive
ENV MEDIA_ROOT=/app/media

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

COPY --from=builder --chown=nextjs:nodejs /app/data/archive ./data/archive

RUN mkdir -p /app/media && chown -R nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000

WORKDIR /app/apps/web
CMD ["node", "server.js"]
