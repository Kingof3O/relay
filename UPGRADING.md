# Upgrade Guide

This guide details instructions for upgrading your Relay Studio installation between versions.

---

## Standard Upgrade Overview

Relay Studio follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).
* **Patch releases (`1.0.x`):** Safe, drop-in bug fixes and security updates. No manual schema interventions required.
* **Minor releases (`1.x.0`):** New features, MCP tools, and performance enhancements. May include non-breaking database migrations.
* **Major releases (`x.0.0`):** Architectural enhancements or updated system prerequisites (e.g. PHP or Node runtime bumps).

Before performing any upgrade, review the corresponding notes below and consult the [Detailed Upgrade Guide](docs/updating.md).

---

## Standard 5-Step Upgrade Procedure

### For Docker Compose Environments:
```bash
# 1. Take a pre-upgrade snapshot
docker compose exec app php artisan relay:backup --include-files

# 2. Pull updated release
git pull origin main

# 3. Rebuild and restart containers
docker compose build --no-cache app
docker compose up -d

# 4. Execute database migrations & warm caches
docker compose exec -T app php artisan migrate --force
docker compose exec -T app php artisan optimize:clear
docker compose exec -T app php artisan optimize

# 5. Verify system health
docker compose exec -T app php artisan relay:doctor
```

### For Bare-Metal / Native VPS Environments:
```bash
# 1. Take a pre-upgrade snapshot
php artisan relay:backup --include-files

# 2. Enable maintenance mode
php artisan down --render="errors::503"

# 3. Pull latest code & update dependencies
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# 4. Run migrations & optimize caches
php artisan migrate --force
php artisan optimize:clear
php artisan optimize

# 5. Restart daemon processes & bring app online
sudo supervisorctl restart all
php artisan up

# 6. Verify health
php artisan relay:doctor
```

---

## Version-Specific Upgrade Instructions

### Upgrading to v1.0.0 (Commercial Production Release)

`v1.0.0` represents the initial commercial production release of Relay Studio.

#### System Requirements
* **PHP:** `8.3` or `8.4` (PHP 8.4 recommended)
* **Node.js:** `20.x` or `22.x` LTS
* **Database:** MySQL `8.0` / `8.4`, PostgreSQL `15` / `16`, or SQLite `3.38+`
* **In-Memory Cache:** Redis `7.x`
* **WebSockets:** Laravel Reverb (integrated)

#### Critical New Configuration Keys
Ensure your `.env` contains the following keys if migrating from an early pre-release:

```ini
# Real-Time WebSockets
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=relay-studio
REVERB_APP_KEY=relay-key
REVERB_APP_SECRET=your-random-secret-key
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=https
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="relay.yourdomain.com"
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https

# Automated Disaster Recovery Backups
RELAY_BACKUP_ENABLED=true
RELAY_BACKUP_SCHEDULE="0 2 * * *"
RELAY_BACKUP_RETENTION_DAYS=14
RELAY_BACKUP_INCLUDE_FILES=false
```

#### MCP Server Compilation
The bundled `@relay/mcp-server` requires compilation before first use:
```bash
cd mcp-server
npm install
npm run build
```
See the [Model Context Protocol (MCP) Guide](docs/mcp.md) for IDE connection configurations.
