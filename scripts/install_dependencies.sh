#!/usr/bin/env bash
set -euo pipefail

# Install deps
npm ci --no-audit --no-fund

# Prepare Husky hooks if installed
if npm pkg get devDependencies.husky | grep -q '"'; then
  npm run prepare || true
fi

echo "Dependencies installed."