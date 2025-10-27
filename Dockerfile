FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY tsconfig.json ./
COPY src ./src
COPY sql ./sql

RUN npx tsc

EXPOSE 8080
CMD ["node", "dist/index.js"]
