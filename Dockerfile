FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

# 1) Install deps (tanpa lockfile)
COPY package.json ./
RUN npm install --no-audit --no-fund

# 2) Build TypeScript
COPY tsconfig.json ./
COPY src ./src
COPY sql ./sql
RUN npx tsc

# 3) Buang devDependencies agar image ramping
RUN npm prune --omit=dev

EXPOSE 8080
CMD ["node", "dist/index.js"]
