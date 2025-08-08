#!/usr/bin/env bash
set -euo pipefail

SUPABASE_DIR="$(dirname "$0")/../supabase"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI not found. Please install from https://supabase.com/docs/guides/cli" >&2
  exit 1
fi

supabase db remote commit || true
supabase db execute --file "$SUPABASE_DIR/init.sql"
supabase db execute --file "$SUPABASE_DIR/seed.sql"

echo "Database init & seed applied."