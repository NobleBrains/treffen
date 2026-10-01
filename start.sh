#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "=== Starte PartyHub & alle Spiele ==="

# Tool-Erkennung (Docker oder Podman)
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v podman-compose >/dev/null 2>&1; then
    COMPOSE="podman-compose"
elif command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
    COMPOSE="podman compose"
else
    echo "FEHLER: Weder 'docker compose' noch 'podman compose' gefunden!"
    echo "Bitte installiere Docker Desktop, OrbStack oder Podman auf deinem System."
    exit 1
fi

echo "Verwende: $COMPOSE"

if [ -n "$MY_DOMAIN" ] && [ "$MY_DOMAIN" != "localhost" ]; then
    echo "No-IP Domain erkannt: $MY_DOMAIN (Starte mit Caddy HTTPS Reverse-Proxy)"
    $COMPOSE -f docker-compose.yml -f docker-compose.caddy.yml up -d --build
else
    echo "Starte im lokalen Modus (Port 3000, 8080, 8085, 5000, 8088)..."
    $COMPOSE up -d --build
fi

echo ""
echo "=========================================================="
echo "🎉 PartyHub läuft erfolgreich!"
echo "=========================================================="
echo "• PartyHub Portal:   http://localhost:3000"
echo "• skribbl:           http://localhost:8080"
echo "• UNO (SunoS):       http://localhost:8085"
echo "• Codenames:         http://localhost:5000"
echo "• Guess The Price:   http://localhost:8088"
if [ -n "$MY_DOMAIN" ] && [ "$MY_DOMAIN" != "localhost" ]; then
    echo "• Öffentliche URL:   https://$MY_DOMAIN"
fi
echo "=========================================================="
