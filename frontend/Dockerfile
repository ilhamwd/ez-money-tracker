FROM node:22-alpine

WORKDIR /app

# Copy package manifests
COPY frontend/package*.json ./

RUN npm install

# Copy frontend source code
COPY frontend/ ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
