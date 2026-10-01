#!/usr/bin/env bash
cd "$(dirname "$0")"

echo "=== Stoppe Treffen & alle Spiele ==="

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v podman-compose >/dev/null 2>&1; then
    COMPOSE="podman-compose"
elif command -v podman >/dev/null 2>&1 && podman compose version >/dev/null 2>&1; then
    COMPOSE="podman compose"
else
    echo "Weder docker compose noch podman compose gefunden."
    exit 1
fi

$COMPOSE -f docker-compose.yml -f docker-compose.caddy.yml down 2>/dev/null || $COMPOSE down
echo "Alle PartyHub-Dienste wurden beendet."
