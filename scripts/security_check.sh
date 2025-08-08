#!/usr/bin/env bash
set -euo pipefail

npm audit --audit-level=moderate || true

# Optional: uncomment if Snyk is available
# npx snyk test || true

echo "Security checks completed."