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
RUN npm run build -- --base=/suite/

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

# --- Builder ---
FROM node:20-alpine AS builder_atlas
WORKDIR /app_atlas

# Install deps for Asphalt Atlas Hub
COPY suite/asphalt-atlas-hub/package.json suite/asphalt-atlas-hub/package-lock.json* suite/asphalt-atlas-hub/bun.lockb* ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps || npm ci --no-audit --no-fund --legacy-peer-deps

# Copy atlas sources
COPY suite/asphalt-atlas-hub/ .

# Build atlas with base path for subdirectory hosting
RUN npm run build -- --base=/suite/atlas/

# --- Builder ---
FROM node:20-alpine AS builder_mapper
WORKDIR /app_mapper

# Install deps for Patrick County Mapper
COPY suite/patrick-county-mapper/package.json suite/patrick-county-mapper/package-lock.json* suite/patrick-county-mapper/bun.lockb* ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps || npm ci --no-audit --no-fund --legacy-peer-deps

# Copy mapper sources
COPY suite/patrick-county-mapper/ .

# Build mapper with base path for subdirectory hosting
RUN npm run build -- --base=/suite/mapper/

# --- Builder ---
FROM node:20-alpine AS builder_weather
WORKDIR /app_weather

# Install deps for PaveWise Weather Cast
COPY suite/pave-wise-weather-cast/package.json suite/pave-wise-weather-cast/package-lock.json* suite/pave-wise-weather-cast/bun.lockb* ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps || npm ci --no-audit --no-fund --legacy-peer-deps

# Copy weather sources
COPY suite/pave-wise-weather-cast/ .

# Build weather with base path for subdirectory hosting
RUN npm run build -- --base=/suite/weather/

# --- Runtime ---
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder_odoo /app_odoo/dist /usr/share/nginx/html/suite
COPY --from=builder_mobile /app_mobile/dist /usr/share/nginx/html/mobile
COPY --from=builder_fleet /app_fleet/dist /usr/share/nginx/html/suite/fleet
COPY --from=builder_atlas /app_atlas/dist /usr/share/nginx/html/suite/atlas
COPY --from=builder_mapper /app_mapper/dist /usr/share/nginx/html/suite/mapper
COPY --from=builder_weather /app_weather/dist /usr/share/nginx/html/suite/weather

# Copy nginx config for SPA fallback
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ | grep -qi '<!DOCTYPE html>' || exit 1

CMD ["nginx", "-g", "daemon off;"]