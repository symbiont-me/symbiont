# Stage 1: Build the application
FROM node:alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

COPY . .

# Stage 2: Create a smaller production image
FROM alpine:3.14

# Install Node.js
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "run", "dev"]
