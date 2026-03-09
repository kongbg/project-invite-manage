FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm install

COPY backend ./backend
COPY frontend ./frontend

RUN pnpm --filter frontend build

RUN rm -rf frontend

RUN mkdir -p /data

VOLUME ["/data"]

ENV DATA_DIR=/data

EXPOSE 3000

CMD ["node", "backend/src/app.js"]
