FROM node:24-alpine

WORKDIR /app
COPY package.json ./
COPY src ./src
COPY scripts ./scripts

RUN addgroup -S mergeradar && adduser -S mergeradar -G mergeradar \
  && mkdir -p /app/data \
  && chown -R mergeradar:mergeradar /app

USER mergeradar
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_FILE=/app/data/mergeradar.json

EXPOSE 3000
CMD ["node", "src/server.js"]
