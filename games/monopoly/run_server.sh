#!/usr/bin/env bash
# Start script for Monopoly 3D Web Edition
set -e

PORT=${PORT:-8090}
HOST=${HOST:-"0.0.0.0"}

cd "$(dirname "$0")"

echo "🎲 Starte Monopoly 3D Web Edition..."
echo "📍 Lokal erreichbar unter: http://localhost:${PORT}"
echo "🌐 Im Netzwerk für Freunde & Handys erreichbar unter: http://$(hostname -I | awk '{print $1}'):${PORT}"
echo "--------------------------------------------------------"

exec python3 server/main.py
