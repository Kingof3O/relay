# Safe Upgrade & Maintenance Guide

Relay Studio is built for predictable, zero-drama updates. This guide explains how to safely update your instance with zero data loss and minimal downtime.

---

## 1. Pre-Upgrade Checklist

Before applying any update:

1. **Review Release Documentation:** Read the [`CHANGELOG.md`](../CHANGELOG.md) and [`UPGRADING.md`](../UPGRADING.md) for breaking changes or new environment variables.
2. **Execute a Full Backup:** Run a full snapshot of your database and attachments:
   ```bash
   # On Docker:
   docker compose exec app php artisan relay:backup --include-files

   # On Bare-Metal:
   php artisan relay:backup --include-files
   ```
3. **Verify Adequate Disk Space:** Ensure at least 3 GB of free disk space is available for container image builds and temporary asset bundles:
   ```bash
   df -h /
   ```

---

## 2. Docker Compose Upgrade Procedure

If you host Relay Studio using Docker Compose:

### Step 1: Pull Latest Code or Extract New Release
```bash
cd /opt/relay

# If tracking Git repository:
git pull origin main

# Or if updating from a commercial release archive:
tar -xzf relay-vX.Y.Z.tar.gz -C /opt/relay --strip-components=1
```

### Step 2: Rebuild & Restart Container Stack
```bash
# Rebuild application container with latest code & dependencies
docker compose build --no-cache app

# Recreate and start containers
docker compose up -d
```

### Step 3: Run Database Migrations
```bash
docker compose exec -T app php artisan migrate --force
```

### Step 4: Warm Application Caches
```bash
docker compose exec -T app php artisan optimize:clear
docker compose exec -T app php artisan optimize
```

### Step 5: Verify Deployment Health
```bash
docker compose exec -T app php artisan relay:doctor
```

---

## 3. Bare-Metal / Ubuntu VPS Upgrade Procedure

If you host Relay Studio natively on an Ubuntu VPS or bare-metal server:

### Step 1: Put Application into Graceful Maintenance Mode
Enable Laravel maintenance mode with a secret bypass token so you can verify the application before public traffic resumes:
```bash
cd /var/www/relay

php artisan down \
  --render="errors::503" \
  --secret="admin-update-bypass"
```

> [!TIP]
> While maintenance mode is active, you can preview the workspace by visiting:
> `https://relay.yourdomain.com/admin-update-bypass`

### Step 2: Pull Latest Source Code
```bash
git pull origin main
```

### Step 3: Install Updated Dependencies
```bash
# Update PHP backend dependencies
composer install --no-dev --optimize-autoloader

# Update and compile JavaScript/TypeScript frontend bundles
npm ci
npm run build
```

### Step 4: Run Database Migrations
```bash
php artisan migrate --force
```

### Step 5: Optimize Framework Caches
```bash
php artisan optimize:clear
php artisan optimize
```

### Step 6: Restart Supervisor Daemons
Restart queue workers, schedulers, and Laravel Reverb WebSocket processes to ensure they load the new PHP bytecode:
```bash
sudo supervisorctl restart all
```

### Step 7: Bring Application Back Online
```bash
php artisan up
```

### Step 8: Run System Diagnostics
```bash
php artisan relay:doctor
```

---

## 4. Zero-Downtime Deployment Strategy (Symlink Releases)

For mission-critical production environments where even 30 seconds of maintenance mode is unacceptable, we recommend a symlink-based deployment model (using tools like **Deployer**, **Envoyer**, or custom bash scripts).

### Directory Structure
```text
/var/www/relay/
├── current -> /var/www/relay/releases/20261026083000
├── shared/
│   ├── .env
│   └── storage/
└── releases/
    ├── 20261026080000/
    └── 20261026083000/
```

### Automated Zero-Downtime Script
```bash
#!/usr/bin/env bash
set -e

RELEASE_DIR="/var/www/relay/releases/$(date +%Y%m%d%H%M%S)"
SHARED_DIR="/var/www/relay/shared"
CURRENT_LINK="/var/www/relay/current"

# 1. Clone new code to isolated release folder
git clone --depth 1 https://github.com/Kingof3O/relay.git "$RELEASE_DIR"
cd "$RELEASE_DIR"

# 2. Link shared storage and .env
rm -rf "$RELEASE_DIR/storage"
ln -nfs "$SHARED_DIR/storage" "$RELEASE_DIR/storage"
ln -nfs "$SHARED_DIR/.env" "$RELEASE_DIR/.env"

# 3. Install packages & build static assets in isolation
composer install --no-dev --optimize-autoloader --no-interaction
npm ci
npm run build

# 4. Run non-destructive database migrations
php artisan migrate --force

# 5. Pre-warm caches
php artisan optimize

# 6. Atomic Symlink Switch
ln -nfs "$RELEASE_DIR" "$CURRENT_LINK"

# 7. Reload daemons and PHP-FPM
sudo systemctl reload php8.4-fpm
sudo supervisorctl restart relay-worker:*
sudo supervisorctl restart relay-reverb
```

---

## 5. Emergency Rollback Procedures

If an unexpected regression or dependency conflict occurs:

### Reverting Docker Deployments
1. Switch back to your previous Git tag or release commit:
   ```bash
   git checkout <previous-tag-or-commit>
   docker compose build app
   docker compose up -d
   ```
2. If database schema was altered incompatibly, restore the pre-update backup:
   ```bash
   docker compose exec -T app php artisan relay:restore /var/www/html/storage/app/backups/relay_db_mysql_<timestamp>.sql --force
   ```
3. Re-run doctor:
   ```bash
   docker compose exec -T app php artisan relay:doctor
   ```

### Reverting Bare-Metal Deployments
1. Revert to previous code revision:
   ```bash
   git checkout <previous-commit>
   composer install --no-dev --optimize-autoloader
   npm ci && npm run build
   ```
2. Restore database:
   ```bash
   php artisan relay:restore storage/app/backups/relay_db_mysql_<timestamp>.sql --force
   ```
3. Restart supervisor and clear caches:
   ```bash
   php artisan optimize:clear
   php artisan optimize
   sudo supervisorctl restart all
   php artisan up
   ```
