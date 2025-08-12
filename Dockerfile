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

# Precompress assets (gzip and brotli)
RUN apk add --no-cache gzip brotli && \
  find /app/dist -type f -regex ".*\.(js\|css\|svg\|html)" -exec sh -c 'gzip -k -f -9 "$1" && brotli -k -f -Z "$1"' sh {} \;

# --- Builder ---
FROM node:20-alpine AS builder_odoo
WORKDIR /app_odoo

# Install deps for Odoo subapp
COPY odoo/asphalt-odoo-prime/package.json odoo/asphalt-odoo-prime/package-lock.json* odoo/asphalt-odoo-prime/bun.lockb* ./
RUN npm ci --no-audit --no-fund

# Copy subapp sources
COPY odoo/asphalt-odoo-prime/ .

# Build subapp with base path for subdirectory hosting
RUN npm run build -- --base=/suite/

# Precompress assets
RUN apk add --no-cache gzip brotli && \
  find /app_odoo/dist -type f -regex ".*\.(js\|css\|svg\|html)" -exec sh -c 'gzip -k -f -9 "$1" && brotli -k -f -Z "$1"' sh {} \;

# --- Builder ---
FROM node:20-alpine AS builder_mobile
WORKDIR /app_mobile

# Install deps for mobile web
COPY mobile/package.json mobile/package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Copy mobile sources
COPY mobile/ .

# Build Expo for web (static export)
RUN npx expo export --platform web --output-dir dist

# Precompress assets
RUN apk add --no-cache gzip brotli && \
  find /app_mobile/dist -type f -regex ".*\.(js\|css\|svg\|html)" -exec sh -c 'gzip -k -f -9 "$1" && brotli -k -f -Z "$1"' sh {} \;

# --- Builder ---
FROM node:20-alpine AS builder_fleet
WORKDIR /app_fleet

# Install deps for Fleet Focus Manager
COPY suite/fleet-focus-manager/package.json suite/fleet-focus-manager/package-lock.json* suite/fleet-focus-manager/bun.lockb* ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps || npm ci --no-audit --no-fund --legacy-peer-deps

# Copy fleet sources
COPY suite/fleet-focus-manager/ .

# Build fleet with base path for subdirectory hosting
RUN npm run build -- --base=/suite/fleet/

# Precompress assets
RUN apk add --no-cache gzip brotli && \
  find /app_fleet/dist -type f -regex ".*\.(js\|css\|svg\|html)" -exec sh -c 'gzip -k -f -9 "$1" && brotli -k -f -Z "$1"' sh {} \;

# --- Runtime ---
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder_odoo /app_odoo/dist /usr/share/nginx/html/suite
COPY --from=builder_mobile /app_mobile/dist /usr/share/nginx/html/mobile
COPY --from=builder_fleet /app_fleet/dist /usr/share/nginx/html/suite/fleet

# Copy nginx config for SPA fallback
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ | grep -qi '<!DOCTYPE html>' || exit 1

CMD ["nginx", "-g", "daemon off;"]