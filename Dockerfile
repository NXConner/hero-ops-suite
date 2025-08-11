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

# --- Builder ---
FROM node:20-alpine AS builder_odoo
WORKDIR /app_odoo

# Install deps for Odoo subapp
COPY odoo/asphalt-odoo-prime/package.json odoo/asphalt-odoo-prime/package-lock.json* odoo/asphalt-odoo-prime/bun.lockb* ./
RUN npm ci --no-audit --no-fund

# Copy subapp sources
COPY odoo/asphalt-odoo-prime/ .

# Build subapp with base path for subdirectory hosting
RUN npm run build -- --base=/odoo/

# --- Runtime ---
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder_odoo /app_odoo/dist /usr/share/nginx/html/odoo

# Copy nginx config for SPA fallback
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ | grep -qi '<!DOCTYPE html>' || exit 1

CMD ["nginx", "-g", "daemon off;"]