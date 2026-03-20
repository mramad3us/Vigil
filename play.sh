#!/bin/bash
# Vigil — local server launcher
# Starts a local HTTP server and opens the game in your default browser.
# Required because CesiumJS needs HTTP to load assets (won't work from file://).

PORT=${1:-8080}
DIR="$(cd "$(dirname "$0")" && pwd)"
VERSION=$(grep -o "V\.version = '[^']*'" "$DIR/core/state.js" | grep -o "'[^']*'" | tr -d "'")

echo "VIGIL v${VERSION} — starting local server on port $PORT..."
echo "Open http://localhost:$PORT in your browser if it doesn't open automatically."
echo "Press Ctrl+C to stop."
echo ""

# Open browser after a short delay
(sleep 1 && open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null) &

cd "$DIR" && python3 -m http.server "$PORT"
