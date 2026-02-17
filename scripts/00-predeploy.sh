#!/usr/bin/env bash
set -euo pipefail

HELPER_DIR="$(cd "$(dirname "$0")/../helper" && pwd)"
URL="http://localhost:3000/AKS-Construction"
TIMEOUT=60
NPM_PID=""

cleanup() {
    echo ""
    echo "Shutting down dev server..."
    if [[ -n "$NPM_PID" ]]; then
        kill -- -"$NPM_PID" 2>/dev/null || kill "$NPM_PID" 2>/dev/null || true
        wait "$NPM_PID" 2>/dev/null || true
    fi
    echo "Done."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check prerequisites
if ! command -v node &>/dev/null; then
    echo "Error: node is not installed or not in PATH." >&2
    exit 1
fi
if ! command -v npm &>/dev/null; then
    echo "Error: npm is not installed or not in PATH." >&2
    exit 1
fi

# Install dependencies if needed
if [[ ! -d "$HELPER_DIR/node_modules" ]] || \
   [[ "$HELPER_DIR/package-lock.json" -nt "$HELPER_DIR/node_modules/.package-lock.json" ]]; then
    echo "Installing dependencies..."
    (cd "$HELPER_DIR" && npm install) || { echo "Error: npm install failed." >&2; exit 1; }
fi

# Check if port 3000 is free
if command -v ss &>/dev/null; then
    EXISTING_PID=$(ss -tlnp 'sport = :3000' 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1 || true)
elif command -v lsof &>/dev/null; then
    EXISTING_PID=$(lsof -ti :3000 2>/dev/null | head -1 || true)
else
    EXISTING_PID=""
fi

if [[ -n "$EXISTING_PID" ]]; then
    echo "Error: Port 3000 is already in use by PID $EXISTING_PID." >&2
    echo "Stop that process first, or run: kill $EXISTING_PID" >&2
    exit 1
fi

# Start dev server in background (suppress CRA's own browser open)
echo "Starting dev server..."
(cd "$HELPER_DIR" && BROWSER=none npm start) &
NPM_PID=$!

# Wait for server to be ready
echo "Waiting for server at $URL ..."
ELAPSED=0
while ! curl -sf -o /dev/null "$URL" 2>/dev/null; do
    if ! kill -0 "$NPM_PID" 2>/dev/null; then
        echo "Error: Dev server process exited unexpectedly." >&2
        exit 1
    fi
    if (( ELAPSED >= TIMEOUT )); then
        echo "Error: Server did not become ready within ${TIMEOUT}s." >&2
        kill -- -"$NPM_PID" 2>/dev/null || kill "$NPM_PID" 2>/dev/null || true
        exit 1
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo "Server is ready."

# Open browser
open_browser() {
    if grep -qi microsoft /proc/version 2>/dev/null; then
        # WSL2 — use PowerShell via full mount path (same approach as the 'open' npm package)
        local ps="/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
        if [[ -x "$ps" ]]; then
            "$ps" -NoProfile Start-Process "$1" && return
        fi
        # Fallback
        if command -v wslview &>/dev/null; then
            wslview "$1" && return
        fi
    fi
    if command -v xdg-open &>/dev/null; then
        xdg-open "$1" && return
    elif command -v open &>/dev/null; then
        open "$1" && return
    fi
    return 1
}

if open_browser "$URL"; then
    echo "Opened $URL in browser."
else
    echo "Could not open browser automatically. Visit: $URL"
fi

echo "Press Ctrl+C to stop the server."
wait "$NPM_PID"
