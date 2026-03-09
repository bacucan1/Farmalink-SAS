FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
WORKDIR /app
COPY package.json turbo.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/gateway/package.json ./packages/gateway/
COPY src/package.json ./src/
RUN npm install

FROM base AS builder
WORKDIR /app
COPY package.json turbo.json ./
COPY packages packages/
COPY src src/
RUN npm install
RUN npm run build:frontend
RUN npm run build:backend

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/gateway ./packages/gateway
COPY --from=builder /app/packages/backend/seed ./packages/backend/seed
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/packages/backend

USER nodejs

EXPOSE 4000

CMD ["node", "dist/server.js"]
