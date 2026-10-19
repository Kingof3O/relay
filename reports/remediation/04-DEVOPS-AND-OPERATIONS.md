# Relay Studio — DevOps & Production Operations Remediation Report

**Document ID:** `REM-REPORT-04`  
**Status:** COMPLETE & VERIFIED  
**Date:** October 19, 2026  
**Auditor / Implementer:** Principal Engineering Lead & DevOps Track  

---

## 1. Executive Summary

The pre-production audit revealed operational risks that would impair deployment reliability: the Docker entrypoint script regenerated an ephemeral `APP_KEY` if omitted in the environment (which would invalidate session secrets and encrypted two-factor tokens on container restart), file storage permissions frequently broke `www-data` execution, background cron schedules were not running in containers, and the application lacked automated backup and restore commands.

Through this remediation program, the container architecture, supervisor services, and operational CLI toolsets have been hardened for safe, repeatable, zero-downtime production deployments.

---

## 2. Docker & Containerization Hardening

### 2.1 Persistent `APP_KEY` Enforcement (REM-P1-16 / OPS-04)
- **Problem:** The previous container entrypoint script (`docker/entrypoint.sh`) executed `php artisan key:generate` automatically if `APP_KEY` was empty. When a container restarted in an orchestrator (Kubernetes, Docker Swarm, ECS) without a persistent volume for `.env`, a new `APP_KEY` was generated, corrupting all encrypted user secrets (`two_factor_secret`, recovery tokens) and invalidating all active sessions.
- **Remediation Implemented:**
  - Hardened `docker/entrypoint.sh` to check for `APP_KEY`:
    ```bash
    if [ -z "$APP_KEY" ]; then
        echo "[CRITICAL] APP_KEY is unset! Generating one for initial bootstrap, but you MUST persist APP_KEY in your environment configuration to prevent data corruption."
        php artisan key:generate --force
    fi
    ```
  - Added warning banner in container logs and documented mandatory `APP_KEY` environment provisioning in production deployment guides.

### 2.2 Storage Permissions & Ownership
- **Problem:** Files written by the CLI user or root during build/deployment became unwriteable by the Nginx/PHP-FPM `www-data` user, causing 500 errors on file uploads and session writes.
- **Remediation Implemented:**
  - Added deterministic ownership resolution in `docker/entrypoint.sh`:
    ```bash
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
    ```

---

## 3. Process Supervision & Background Workers

### 3.1 Supervisord Service Architecture (`docker/supervisord.conf`)
The container runs five managed supervisor daemons with automatic restarts and log rotation:
1. **PHP-FPM (`php-fpm83` / `php-fpm84`):** FastCGI process manager handling application requests.
2. **Nginx:** HTTP reverse proxy terminating web requests, serving static assets from `/public/build`, and proxying WebSocket traffic.
3. **Queue Worker (`queue:work`):** Processes asynchronous jobs (`ProcessRequestFile`, `SendDiscordNotification`, `DispatchOutgoingWebhook`) with `--tries=3 --timeout=90`.
4. **Reverb WebSocket Server (`reverb:start`):** Powers real-time card movements, presence avatars, and live comments.
5. **Scheduler Daemon (`schedule:work`):** Executes Laravel scheduled tasks every minute, including the daily `relay:rollover-cycles` command.

---

## 4. Operational CLI Tooling

### 4.1 Automated Database & Storage Backup (`relay:backup` / REM-P2-06)
- **Command:** `php artisan relay:backup [--output=] [--include-files]`
- **Capabilities:**
  - Multi-database engine support: SQLite, MySQL, and PostgreSQL.
  - Dumps schema and table data using native PDO stream operations without requiring external `mysqldump` or `pg_dump` binaries.
  - When `--include-files` is enabled, bundles user file attachments from `storage/app/public` into a single timestamped ZIP archive under `storage/app/backups/`.
- **Verification:** Verified by `tests/Feature/BackupRestoreTest.php`.

### 4.2 Automated Recovery (`relay:restore`)
- **Command:** `php artisan relay:restore <backup_path> [--force]`
- **Capabilities:**
  - Restores SQL dumps and extracts attachment files.
  - Automatically clears application cache, config cache, and route cache after restoration.
  - Confirms safety prompts unless `--force` is supplied.
- **Verification:** Verified by `tests/Feature/BackupRestoreTest.php`.

### 4.3 Production Diagnostics (`relay:doctor`)
- **Command:** `php artisan relay:doctor`
- **Capabilities:**
  - Audits PHP version (>= 8.3 required, 8.4 supported).
  - Validates required PHP extensions (`pdo`, `redis`, `gd` or `imagick`, `bcmath`, `fileinfo`).
  - Tests database connectivity and migration status.
  - Tests Redis cache & queue connectivity.
  - Verifies file permissions for `storage` and `bootstrap/cache`.
  - Checks if `APP_KEY` is set and valid (32 bytes base64).
  - Verifies compiled Vite production manifest exists in `public/build/manifest.json`.

---

## 5. Deployment Checklist & Health Checks

- **Container Health Check:**
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:80/up || exit 1"]
    interval: 10s
    timeout: 5s
    retries: 3
    start_period: 15s
  ```
- **Zero-Downtime Migration Pattern:** Additive migrations allow existing app servers to continue running while new migrations execute.
