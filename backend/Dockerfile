FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy root .env into backend during build
COPY .env ./

# Copy backend package manifests and Prisma schema
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm install

# Copy backend source code
COPY backend/ ./

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
