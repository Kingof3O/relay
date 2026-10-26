# Disaster Recovery: Backup & Restore Guide

Relay Studio includes a built-in, standalone disaster recovery engine engineered to safeguard your engineering workspace data against hardware failures, accidental deletions, or corrupt migrations.

---

## 1. Backup Architecture & File Types

Relay Studio splits backup data into two isolated, portable artifacts:

| Artifact | File Naming Pattern | Contents |
| :--- | :--- | :--- |
| **Database Snapshot** | `relay_db_{driver}_{timestamp}.sql` | Complete ANSI SQL dump of all relational tables, schema migrations, users, issues, sprints, comments, and audit logs. |
| **Media Attachments** | `relay_attachments_{timestamp}.zip` | Compressed zip archive containing all user attachments, ticket screenshots, design specs, and WebP thumbnail assets from `storage/app/public`. |

By default, backup archives are generated in `storage/app/backups/`.

---

## 2. Automated Scheduled Backups

Relay Studio can automatically execute daily backups via Laravel's built-in scheduler.

### Environment Configuration (`.env`)

Configure the following variables in your `.env` file:

```ini
# Enable or disable automated scheduled backups (default: false)
RELAY_BACKUP_ENABLED=true

# Standard 5-part cron expression (default: 0 2 * * * = daily at 02:00 UTC)
RELAY_BACKUP_SCHEDULE="0 2 * * *"

# Number of days to retain backups before automatic pruning (default: 14)
RELAY_BACKUP_RETENTION_DAYS=14

# Whether automated daily backup includes attachments or database only
RELAY_BACKUP_INCLUDE_FILES=true

# Custom local storage path (optional, defaults to storage/app/backups)
RELAY_BACKUP_DESTINATION="/var/backups/relay"
```

### Automatic Retention Pruning
Every time `relay:backup` executes, it scans the destination directory and safely deletes any SQL or ZIP archives whose modification timestamp is older than `RELAY_BACKUP_RETENTION_DAYS`. This prevents unexpected disk exhaustion over time.

---

## 3. Manual On-Demand Backups (`relay:backup`)

You can create an instant snapshot anytime before making system modifications or upgrading software:

```bash
# 1. Database-only backup (fastest, lightweight)
php artisan relay:backup --only-db

# 2. Complete backup (database dump + compressed attachments archive)
php artisan relay:backup --include-files

# 3. Media attachments only
php artisan relay:backup --only-files

# 4. Save to a custom directory
php artisan relay:backup --include-files --output=/mnt/secure-backups/relay

# 5. Execute via Docker Compose
docker compose exec app php artisan relay:backup --include-files
```

### Sample Output
```text
Starting Relay Studio production backup procedure...
Dumping database tables (mysql)...
✔ Database dump generated (relay_db_mysql_2026-10-26_083000.sql).
Archiving attachments and media assets...
✔ Attachments zip created (relay_attachments_2026-10-26_083000.zip).
Pruned 2 backup archive(s) older than 14 days.

=== Relay Studio Backup Summary ===
 - /var/www/html/storage/app/backups/relay_db_mysql_2026-10-26_083000.sql (1,420.50 KB)
 - /var/www/html/storage/app/backups/relay_attachments_2026-10-26_083000.zip (48,210.15 KB)
```

---

## 4. Restoring from a Backup (`relay:restore`)

Relay Studio includes an integrated `relay:restore` command capable of parsing both SQL schema files and attachment ZIP archives.

> [!WARNING]
> Restoring a database snapshot completely replaces the current database contents. Always take a fresh snapshot of current state before executing a restore.

### Restoring the Database
```bash
# Interactive mode (will prompt for confirmation)
php artisan relay:restore /path/to/relay_db_mysql_2026-10-26_083000.sql

# Non-interactive / unattended restoration:
php artisan relay:restore /path/to/relay_db_mysql_2026-10-26_083000.sql --force

# Inside Docker Compose:
docker compose exec -T app php artisan relay:restore /var/www/html/storage/app/backups/relay_db_mysql_2026-10-26_083000.sql --force
```

### Restoring Media & File Attachments
```bash
# Extract files directly back into storage/app/public
php artisan relay:restore /path/to/relay_attachments_2026-10-26_083000.zip --force
```

### Post-Restore Finalization
The restore command automatically flushes the Redis application cache. After a restore, verify the workspace:
```bash
php artisan relay:doctor
```

---

## 5. Off-Site S3 / Cloud Storage Synchronization

Keeping backups solely on the host server leaves your data vulnerable to provider outages or disk hardware destruction. We recommend streaming backups off-site to Amazon S3, Cloudflare R2, or Backblaze B2.

### Option A: AWS CLI S3 Sync

Install the AWS CLI:
```bash
sudo apt install -y awscli
aws configure
```

Create a synchronization script at `/usr/local/bin/relay-s3-sync.sh`:
```bash
#!/usr/bin/env bash
set -e

SOURCE_DIR="/var/www/relay/storage/app/backups"
BUCKET_NAME="s3://my-company-relay-backups/daily"

# Synchronize local backup directory to private S3 bucket
aws s3 sync "$SOURCE_DIR" "$BUCKET_NAME" --delete --sse AES256

echo "Backup sync to S3 completed at $(date)"
```

Make executable and schedule in host root crontab:
```bash
chmod +x /usr/local/bin/relay-s3-sync.sh
# Add to /etc/cron.d/relay-backup-sync:
0 3 * * * root /usr/local/bin/relay-s3-sync.sh >> /var/log/relay-s3-sync.log 2>&1
```

### Option B: Rclone (Multi-Cloud: Cloudflare R2 / Backblaze / Wasabi)
```bash
# Sync with Cloudflare R2
rclone sync /var/www/relay/storage/app/backups r2:relay-backups/production/
```

---

## 6. Disaster Recovery Drill (Bare-Metal Recovery Runbook)

To test or perform a bare-metal rebuild of Relay Studio on a new server using your backup files:

1. **Provision New Host:** Install Docker and Docker Compose (or PHP 8.4 stack) on the replacement server.
2. **Download Codebase:** Pull or extract your Relay Studio release.
3. **Configure Environment:** Copy your original `.env` file (especially `APP_KEY`, which must remain identical to decrypt encrypted fields and TOTP secrets).
4. **Boot Empty Database:**
   ```bash
   docker compose up -d
   ```
5. **Transfer Backup Artifacts:** Copy your latest SQL dump and attachment ZIP to the server.
6. **Execute Restore:**
   ```bash
   docker compose cp ./relay_db_latest.sql app:/tmp/relay_db.sql
   docker compose cp ./relay_attachments_latest.zip app:/tmp/relay_attachments.zip

   docker compose exec app php artisan relay:restore /tmp/relay_db.sql --force
   docker compose exec app php artisan relay:restore /tmp/relay_attachments.zip --force
   ```
7. **Verify Operational State:**
   ```bash
   docker compose exec app php artisan relay:doctor
   ```

Your workspace is fully restored with all user credentials, active sprints, historical comments, and media intact.
