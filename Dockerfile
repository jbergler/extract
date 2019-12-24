# Throwaway layer for npm
FROM node:13-alpine AS build

WORKDIR /app

RUN apk add --no-cache \
    git \
    build-base \
    libc6-compat

COPY *.json ./
RUN npm install

COPY . ./

# Build a slim image for the app
FROM node:13-alpine AS image

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=build /app/ ./

EXPOSE 3000
HEALTHCHECK CMD "curl http://localhost:3000/health_check"

CMD ["node", "app/server.js"]
