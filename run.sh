#!/bin/sh
# Stratus launcher: no build step. Opens the app in your default browser.
# Usage: ./run.sh          (open index.html directly, works offline)
#        ./run.sh serve    (serve over http://localhost:8341 instead)
cd "$(dirname "$0")" || exit 1
if [ "$1" = "serve" ]; then
  echo "Serving on http://localhost:8341  (Ctrl+C to stop)"
  (sleep 1; open "http://localhost:8341/index.html" 2>/dev/null || xdg-open "http://localhost:8341/index.html") &
  exec python3 -m http.server 8341
else
  open index.html 2>/dev/null || xdg-open index.html
fi
