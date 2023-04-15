# syntax=docker/dockerfile:1
FROM node:18.16.0-alpine3.17 as builder
WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

FROM node:18.16.0-alpine3.17
WORKDIR /usr
COPY package.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./
CMD ["node", "bot.js"]
