FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate --generator client
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install build dependencies needed to compile bcrypt for Alpine
RUN apk add --no-cache python3 make g++
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/prisma/seed ./src/prisma/seed
COPY package*.json ./
# Rebuild bcrypt for the Alpine environment
RUN npm rebuild bcrypt --build-from-source
# copy entrypoint that runs migrations then starts the app
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
EXPOSE 3001
ENTRYPOINT ["/app/entrypoint.sh"]
