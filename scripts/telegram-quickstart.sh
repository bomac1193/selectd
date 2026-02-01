#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGROK_CONFIG="/tmp/selectr-ngrok.yml"

load_env_file() {
  local file="$1"
  if [[ -f "$file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$file"
    set +a
  fi
}

cleanup() {
  if [[ -n "${WEB_PID:-}" ]] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID"
  fi
  if [[ -n "${BOT_PID:-}" ]] && kill -0 "$BOT_PID" 2>/dev/null; then
    kill "$BOT_PID"
  fi
  if [[ -n "${NGROK_PID:-}" ]] && kill -0 "$NGROK_PID" 2>/dev/null; then
    kill "$NGROK_PID"
  fi
  rm -f "$NGROK_CONFIG"
}

trap cleanup EXIT

load_env_file "$ROOT_DIR/.env.local"
load_env_file "$ROOT_DIR/bot/.env"

BOT_USERNAME="${NEXT_PUBLIC_TELEGRAM_BOT_USERNAME:-SelectrBot}"
APP_SHORT_NAME="${NEXT_PUBLIC_TELEGRAM_APP_SHORT_NAME:-selectr}"
WEB_PORT="${WEB_PORT:-3000}"
BOT_PORT="${BOT_PORT:-${PORT:-4589}}"
unset PORT

port_available() {
  python3 - <<PY "$1"
import socket, sys
port = int(sys.argv[1])
s = socket.socket()
try:
    s.bind(("127.0.0.1", port))
    s.close()
    sys.exit(0)
except OSError:
    sys.exit(1)
PY
}

if ! port_available "$WEB_PORT"; then
  for candidate in 3000 3001 3002 3003 3004 3010 3011 3020 3030; do
    if port_available "$candidate"; then
      WEB_PORT="$candidate"
      break
    fi
  done
fi

if ! port_available "$WEB_PORT"; then
  WEB_PORT=$(python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
)
fi

if ! port_available "$BOT_PORT"; then
  for candidate in 4589 4590 4591 4592 4699 4799 4899 4999 5099 5199 5299; do
    if port_available "$candidate"; then
      BOT_PORT="$candidate"
      break
    fi
  done
fi

if ! port_available "$BOT_PORT"; then
  BOT_PORT=$(python3 - <<'PY'
import socket
s = socket.socket()
s.bind(("127.0.0.1", 0))
print(s.getsockname()[1])
s.close()
PY
)
fi

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is not installed. Install it first: https://ngrok.com/download"
  exit 1
fi

if [[ -n "${NGROK_AUTHTOKEN:-}" ]]; then
  ngrok config add-authtoken "${NGROK_AUTHTOKEN}" >/dev/null 2>&1 || true
fi

if pgrep -f "$ROOT_DIR/node_modules/.bin/next dev" >/dev/null 2>&1; then
  echo "Another SELECTR dev server is already running. Stop it before continuing."
  exit 1
fi

if [[ -d "$ROOT_DIR/.next/dev" ]]; then
  rm -rf "$ROOT_DIR/.next/dev"
fi

echo "Starting Next.js dev server on port ${WEB_PORT}..."
# Force IPv4 binding so ngrok can reach the dev server at 127.0.0.1
( cd "$ROOT_DIR" && PORT="$WEB_PORT" BOT_PORT="$BOT_PORT" npm run dev -- --hostname 127.0.0.1 --port "$WEB_PORT" ) &
WEB_PID=$!

wait_for_port() {
  local port="$1"
  for _ in {1..30}; do
    python3 - <<PY "$port"
import socket, sys
port = int(sys.argv[1])
s = socket.socket()
s.settimeout(0.2)
try:
    s.connect(("127.0.0.1", port))
    s.close()
    sys.exit(0)
except OSError:
    sys.exit(1)
PY
    if [[ $? -eq 0 ]]; then
      return 0
    fi
    sleep 1
  done
  return 1
}

if ! wait_for_port "$WEB_PORT"; then
  echo "Next.js did not start on port ${WEB_PORT}. Check for lock errors."
  exit 1
fi

cat <<YAML > "$NGROK_CONFIG"
version: "3"
tunnels:
  selectr-web:
    proto: http
    addr: ${WEB_PORT}
YAML

chmod 600 "$NGROK_CONFIG"

echo "Starting ngrok tunnel for web..."
ngrok start --all --config "$NGROK_CONFIG" --log=stdout > /tmp/selectr-ngrok.log 2>&1 &
NGROK_PID=$!

get_public_url() {
  local name="$1"
  local url=""
  for _ in {1..30}; do
    if [[ -f /tmp/selectr-ngrok.log ]]; then
      url=$(awk -v name="$name" '
        $0 ~ /started tunnel/ && $0 ~ ("name=" name " ") {
          for (i = 1; i <= NF; i++) {
            if ($i ~ /^url=/) {
              sub(/^url=/, "", $i)
              print $i
              exit
            }
          }
        }
      ' /tmp/selectr-ngrok.log)
    fi
    if [[ -n "$url" ]]; then
      echo "$url"
      return 0
    fi
    sleep 1
  done
  return 1
}

WEB_URL=$(get_public_url selectr-web || true)
BOT_APP_URL="${WEB_URL:-${SELECTR_APP_URL:-https://selectr.vercel.app}}"
WEBHOOK_URL="${WEB_URL:-}/api/telegram/webhook"

echo "Starting Telegram bot dev server on port ${BOT_PORT}..."
( cd "$ROOT_DIR" && SELECTR_APP_URL="$BOT_APP_URL" BOT_PORT="$BOT_PORT" PORT="$BOT_PORT" npm run bot:dev ) &
BOT_PID=$!

sleep 2

echo ""
echo "Telegram quickstart ready:"
if [[ -n "$WEB_URL" ]]; then
  echo "- Web URL: $WEB_URL"
else
  echo "- Web URL: (not found yet; check /tmp/selectr-ngrok.log)"
fi

echo ""
echo "BotFather updates:"
if [[ -n "$WEB_URL" ]]; then
  echo "- /myapps -> Edit link -> $WEB_URL"
  echo "- /setmenubutton -> Web App URL -> $WEB_URL"
else
  echo "- /myapps -> Edit link -> (use web URL above)"
  echo "- /setmenubutton -> Web App URL -> (use web URL above)"
fi

echo ""
echo "Direct Mini App link: https://t.me/${BOT_USERNAME}/${APP_SHORT_NAME}"

echo ""
if [[ -n "${TELEGRAM_BOT_TOKEN:-}" && -n "$WEB_URL" ]]; then
  echo "Setting webhook to ${WEBHOOK_URL}..."
  set +e
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    -d "url=${WEBHOOK_URL}" | python3 - <<'PY'
import json, sys
try:
    data = json.load(sys.stdin)
    print("Webhook response:", data)
except Exception:
    print("Webhook response: (unable to parse)")
PY
  set -e
else
  echo "Webhook command:"
  echo "export TELEGRAM_BOT_TOKEN=..."
  echo "curl -X POST \"https://api.telegram.org/bot<your_token>/setWebhook\" -d \"url=<web-url>/api/telegram/webhook\""
fi

echo ""
echo "Press Ctrl+C to stop servers and tunnel."

wait
