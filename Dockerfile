# ====== Stage 1: Builder (install + build TS) ======
FROM node:20-slim AS builder
WORKDIR /app

# Install semua deps (termasuk dev) → butuh typescript utk compile
COPY package.json ./
RUN npm install --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src
COPY sql ./sql

# Compile TypeScript → menghasilkan /app/dist
RUN npx tsc

# ====== Stage 2: Runtime (hanya prod deps + dist) ======
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Bawa hasil build & SQL
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/sql ./sql

EXPOSE 8080
CMD ["node", "dist/index.js"]
