FROM node:20-alpine

RUN apk add --no-cache python3 make g++ \
    && ln -sf python3 /usr/bin/python

RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads data

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]