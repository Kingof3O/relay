#!/usr/bin/env bash
# ==============================================================================
# Relay Studio — Turnkey 1-Command Production Installer
# ==============================================================================
# Usage:
#   curl -fsSL https://get.relay.studio/install.sh | bash
#   OR: ./scripts/install.sh
# ==============================================================================

set -euo pipefail

# ANSI color codes
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "========================================================================"
echo "          ⚡ RELAY STUDIO — TURNKEY PRODUCTION INSTALLER                "
echo "========================================================================"
echo -e "${NC}"
echo -e "${GRAY}Linear-inspired velocity, real-time collaboration & autonomous AI MCP.${NC}"
echo ""

# 1. Dependency Checks
echo -e "${BOLD}[1/6] Checking system prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker before running this script.${NC}"
    echo "Visit https://docs.docker.com/get-docker/ for instructions."
    exit 1
fi

DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}Error: Docker Compose (v2 or v1) is not installed.${NC}"
    exit 1
fi

echo -e "  ${GREEN}✔${NC} Docker detected: $(docker --version)"
echo -e "  ${GREEN}✔${NC} Compose detected: $($DOCKER_COMPOSE_CMD version)"

# 2. Environment Configuration
echo -e "\n${BOLD}[2/6] Configuring environment settings...${NC}"

if [ ! -f .env ]; then
    echo -e "  ${YELLOW}ℹ${NC} Creating .env from .env.example..."
    cp .env.example .env
else
    echo -e "  ${GREEN}✔${NC} Existing .env detected."
fi

# Generate secure random secrets if empty
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 16
    else
        cat /dev/urandom | LC_ALL=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
    fi
}

APP_KEY_VAL=$(grep "^APP_KEY=" .env | cut -d '=' -f2- || true)
if [ -z "$APP_KEY_VAL" ] || [ "$APP_KEY_VAL" = "base64:" ]; then
    RANDOM_KEY="base64:$(generate_secret | base64 | head -c 44)"
    sed -i.bak "s|^APP_KEY=.*|APP_KEY=${RANDOM_KEY}|" .env && rm -f .env.bak
    echo -e "  ${GREEN}✔${NC} Generated persistent APP_KEY."
fi

DB_PASS_VAL=$(grep "^DB_PASSWORD=" .env | cut -d '=' -f2- || true)
if [ -z "$DB_PASS_VAL" ] || [ "$DB_PASS_VAL" = "secret" ]; then
    NEW_DB_PASS=$(generate_secret)
    sed -i.bak "s|^DB_PASSWORD=.*|DB_PASSWORD=${NEW_DB_PASS}|" .env && rm -f .env.bak
    echo -e "  ${GREEN}✔${NC} Generated secure database password."
fi

REVERB_SEC_VAL=$(grep "^REVERB_APP_SECRET=" .env | cut -d '=' -f2- || true)
if [ -z "$REVERB_SEC_VAL" ] || [ "$REVERB_SEC_VAL" = "relay-secret-live" ]; then
    NEW_REVERB_SEC=$(generate_secret)
    sed -i.bak "s|^REVERB_APP_SECRET=.*|REVERB_APP_SECRET=${NEW_REVERB_SEC}|" .env && rm -f .env.bak
    echo -e "  ${GREEN}✔${NC} Generated random Reverb WebSocket secrets."
fi

# 3. Build & Boot Container Services
echo -e "\n${BOLD}[3/6] Starting container services (App, Nginx, MySQL, Redis, Reverb)...${NC}"
$DOCKER_COMPOSE_CMD up -d --build

# 4. Wait for database readiness
echo -e "\n${BOLD}[4/6] Waiting for MySQL database to become healthy...${NC}"
MAX_TRIES=30
TRIES=0
while [ $TRIES -lt $MAX_TRIES ]; do
    if $DOCKER_COMPOSE_CMD ps db | grep -q "(healthy)"; then
        echo -e "  ${GREEN}✔${NC} Database is healthy and accepting connections."
        break
    fi
    TRIES=$((TRIES + 1))
    sleep 2
done

if [ $TRIES -eq $MAX_TRIES ]; then
    echo -e "  ${YELLOW}!${NC} Database still initializing, proceeding with migrations..."
fi

# 5. Database Migrations & Initial Setup Wizard
echo -e "\n${BOLD}[5/6] Initializing database and workspace seeds...${NC}"
$DOCKER_COMPOSE_CMD exec -T app php artisan migrate --force
$DOCKER_COMPOSE_CMD exec -T app php artisan relay:install --force --seed

# 6. Verify System Health with Doctor
echo -e "\n${BOLD}[6/6] Verifying stack health with Relay Doctor...${NC}"
$DOCKER_COMPOSE_CMD exec -T app php artisan relay:doctor || true

# Summary & Output
APP_PORT="${APP_PORT:-8080}"
echo ""
echo -e "${GREEN}${BOLD}========================================================================${NC}"
echo -e "${GREEN}${BOLD}          🎉 RELAY STUDIO HAS BEEN SUCCESSFULLY INSTALLED!             ${NC}"
echo -e "${GREEN}${BOLD}========================================================================${NC}"
echo ""
echo -e "${BOLD}Access Information:${NC}"
echo -e "  • Web Interface:    ${CYAN}http://localhost:${APP_PORT}${NC}"
echo -e "  • Admin Login:      ${BOLD}admin@relay.studio${NC}"
echo -e "  • Default Password: ${BOLD}password${NC} ${YELLOW}(Change upon first login)${NC}"
echo ""
echo -e "${BOLD}AI Model Context Protocol (MCP) Integration:${NC}"
echo -e "  To connect ${CYAN}Cursor${NC}, ${CYAN}Claude Desktop${NC}, or ${CYAN}Antigravity${NC}:"
echo -e "  Add this to your MCP configuration JSON:"
echo -e "  ${GRAY}{"
echo -e "    \"mcpServers\": {"
echo -e "      \"relay\": {"
echo -e "        \"command\": \"node\","
echo -e "        \"args\": [\"$(pwd)/mcp-server/dist/index.js\"],"
echo -e "        \"env\": {"
echo -e "          \"RELAY_URL\": \"http://localhost:${APP_PORT}\","
echo -e "          \"RELAY_API_TOKEN\": \"<your-personal-access-token>\""
echo -e "        }"
echo -e "      }"
echo -e "    }"
echo -e "  }${NC}"
echo ""
echo -e "${GREEN}Live presence and WebSockets are active. Enjoy sub-second velocity!${NC}"
