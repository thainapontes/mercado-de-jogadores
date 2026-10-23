FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/passe?schema=public"

COPY package.json package-lock.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
