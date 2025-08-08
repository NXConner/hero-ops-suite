# syntax=docker/dockerfile:1

# --- Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* bun.lockb* ./
RUN npm ci --no-audit --no-fund

# Copy sources
COPY . .

# Build
RUN npm run build

# --- Runtime ---
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for SPA fallback
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ | grep -qi '<!DOCTYPE html>' || exit 1

CMD ["nginx", "-g", "daemon off;"]