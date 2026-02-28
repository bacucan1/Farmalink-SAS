FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY gateway/package.json gateway/package-lock.json* ./gateway/
RUN npm install --include=dev && npm install --prefix ./gateway

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx vite build
RUN npx tsc -p tsconfig.backend.json

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/backend/seed ./dist/backend/seed
COPY --from=builder /app/backend/seed/*.js ./dist/backend/seed/

USER nodejs

EXPOSE 3000

CMD ["node", "dist/backend/server.js"]