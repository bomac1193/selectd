#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cleanup() {
  if [[ -n "${WEB_PID:-}" ]] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID"
  fi
  if [[ -n "${BOT_PID:-}" ]] && kill -0 "$BOT_PID" 2>/dev/null; then
    kill "$BOT_PID"
  fi
}

trap cleanup EXIT

echo "Starting Next.js dev server..."
# Force IPv4 binding so local proxies (ngrok) can reach the dev server.
( cd "$ROOT_DIR" && npm run dev -- --hostname 127.0.0.1 ) &
WEB_PID=$!

sleep 2

echo "Starting Telegram bot dev server..."
( cd "$ROOT_DIR" && npm run bot:dev ) &
BOT_PID=$!

wait
