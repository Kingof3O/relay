# Relay Studio Installation Guide

Relay Studio is designed for effortless deployment whether you are running a single container on a lightweight virtual private server (VPS) or orchestrating an enterprise bare-metal cluster.

This guide provides step-by-step instructions for:
1. [Prerequisites & System Specifications](#1-prerequisites--system-specifications)
2. [Turnkey 1-Command Automated Installation](#2-turnkey-1-command-automated-installation-fastest)
3. [Production Docker Compose Deployment](#3-production-docker-compose-deployment)
4. [Bare-Metal / Ubuntu VPS Manual Deployment](#4-bare-metal--ubuntu-vps-manual-deployment)
5. [Post-Installation Verification with Relay Doctor](#5-post-installation-verification-with-relay-doctor)

---

## 1. Prerequisites & System Specifications

### Minimum Hardware Specifications (Small Teams: 1–25 Users)
* **CPU:** 1 Virtual CPU (x86_64 or ARM64)
* **RAM:** 2 GB physical memory (plus 1 GB swap recommended)
* **Storage:** 15 GB NVMe or SSD storage
* **Operating System:** Ubuntu 22.04 LTS / 24.04 LTS, Debian 12, Rocky Linux 9, or macOS (via Docker)

### Recommended Production Specifications (Teams: 25–250+ Users)
* **CPU:** 2–4 Virtual CPUs
* **RAM:** 4–8 GB physical memory
* **Storage:** 40+ GB fast NVMe storage
* **Network:** Static public IPv4/IPv6 address with open ports 80 (HTTP) and 443 (HTTPS)

### Core Software Stack
* **PHP:** `^8.3` or `^8.4` with extensions (`pdo`, `mbstring`, `xml`, `curl`, `zip`, `bcmath`, `gd`, `intl`, `fileinfo`, `redis`)
* **Node.js:** `^20.x` or `^22.x` (LTS) & npm `^10.x`
* **Database:** MySQL `^8.0` / `8.4`, MariaDB `^10.11`, PostgreSQL `^15` / `^16`, or SQLite `^3.38` (testing/small solo teams)
* **In-Memory Cache & Queue:** Redis `^7.0`
* **WebSocket Engine:** Laravel Reverb (included in application runtime)
* **Process Supervisor:** Supervisord `^4.2` or Systemd
* **Reverse Proxy:** Nginx `^1.24+`, Caddy `^2.7+`, or Traefik `^3.0+`

---

## 2. Turnkey 1-Command Automated Installation (Fastest)

If you have a fresh server with Docker and Docker Compose installed, run our turnkey script to bootstrap Relay Studio in under two minutes:

```bash
curl -fsSL https://get.relay.studio/install.sh | bash
```

Alternatively, if you have already cloned the repository or extracted the release tarball:

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### What the installer handles automatically:
1. Validates Docker and Docker Compose prerequisites.
2. Creates your production `.env` file with cryptographically secure random secrets (`APP_KEY`, `DB_PASSWORD`, `REVERB_APP_SECRET`).
3. Builds and boots the production container cluster (`app`, `db`, `redis`, `mailpit`).
4. Awaits database health readiness check.
5. Runs schema migrations (`php artisan migrate --force`).
6. Runs the Relay Setup Wizard (`php artisan relay:install --force --seed`).
7. Executes `php artisan relay:doctor` to verify container networking, database connectivity, and permissions.

---

## 3. Production Docker Compose Deployment

For complete infrastructure control using Docker Compose:

### Step 1: Extract Release Files & Enter Directory
```bash
# Extract your purchased commercial release or clone the repository
git clone https://github.com/Kingof3O/relay.git /opt/relay
cd /opt/relay
```

### Step 2: Initialize Environment Variables
```bash
cp .env.example .env
```

Generate secure random keys and secrets in `.env`:

```bash
# Generate primary application encryption key
php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
# Insert the output into APP_KEY=

# Generate random DB and WebSocket credentials
openssl rand -hex 16 # for DB_PASSWORD
openssl rand -hex 16 # for REVERB_APP_SECRET
```

Ensure the following variables are configured in `.env`:
```ini
APP_NAME="Relay Studio"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://relay.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=relay
DB_USERNAME=relay
DB_PASSWORD=your_secure_db_password

REDIS_HOST=redis
REDIS_PORT=6379
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=relay-studio
REVERB_APP_KEY=relay-key
REVERB_APP_SECRET=your_reverb_secret
REVERB_HOST=0.0.0.0
REVERB_PORT=8080
REVERB_SCHEME=https

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="relay.yourdomain.com"
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### Step 3: Build & Launch Containers
```bash
docker compose up -d --build
```

### Step 4: Run Initial Database Migrations & Initial Setup
```bash
# Execute database migrations
docker compose exec -T app php artisan migrate --force

# Run turnkey setup wizard to create initial owner and seeded entities
docker compose exec -T app php artisan relay:install --force --seed
```

> [!TIP]
> The initial administrative login credentials created by `--seed` are:
> * **Email:** `admin@relay.studio`
> * **Password:** `password`
> 
> You will be prompted to update this password immediately upon first sign-in.

---

## 4. Bare-Metal / Ubuntu VPS Manual Deployment

If hosting without Docker on a native Ubuntu 24.04 LTS or 22.04 LTS instance:

### Step 1: Install System Dependencies & PHP 8.4
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y software-properties-common curl git unzip nginx supervisor redis-server

# Add Ondřej Surý PHP PPA for PHP 8.4
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update

sudo apt install -y \
  php8.4-fpm \
  php8.4-cli \
  php8.4-common \
  php8.4-mysql \
  php8.4-pgsql \
  php8.4-sqlite3 \
  php8.4-redis \
  php8.4-mbstring \
  php8.4-xml \
  php8.4-curl \
  php8.4-zip \
  php8.4-bcmath \
  php8.4-gd \
  php8.4-intl \
  php8.4-fileinfo
```

### Step 2: Install Node.js 22 LTS & Composer
```bash
# Install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install Composer 2
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### Step 3: Configure Database (MySQL 8.4)
```bash
sudo apt install -y mysql-server
sudo mysql -u root <<EOF
CREATE DATABASE relay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'relay'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON relay.* TO 'relay'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### Step 4: Clone Application & Configure Permissions
```bash
sudo mkdir -p /var/www/relay
sudo chown -R $USER:$USER /var/www/relay
git clone https://github.com/Kingof3O/relay.git /var/www/relay
cd /var/www/relay

# Install production PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies & build front-end
npm ci
npm run build

# Configure file storage permissions
sudo chown -R www-data:www-data /var/www/relay/storage /var/www/relay/bootstrap/cache
sudo chmod -R 775 /var/www/relay/storage /var/www/relay/bootstrap/cache
```

### Step 5: Configure Application Environment
```bash
cp .env.example .env
php artisan key:generate
php artisan storage:link
```

Edit `/var/www/relay/.env` with your database credentials, URL, and Redis configuration:
```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://relay.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=relay
DB_USERNAME=relay
DB_PASSWORD=StrongPassword123!

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=relay-studio
REVERB_APP_KEY=relay-live-key
REVERB_APP_SECRET=reverb-secret-string
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=https

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="relay.yourdomain.com"
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

Run schema migrations and initialize workspace:
```bash
php artisan migrate --force
php artisan relay:install --force --seed
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 6: Configure Supervisord Daemons
Create `/etc/supervisor/conf.d/relay.conf`:
```ini
[program:relay-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/relay/artisan queue:work redis --sleep=3 --tries=3 --timeout=90
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/relay/storage/logs/worker.log

[program:relay-scheduler]
process_name=%(program_name)s
command=/bin/sh -c "while [ true ]; do (php /var/www/relay/artisan schedule:run --verbose --no-interaction &); sleep 60; done"
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/relay/storage/logs/scheduler.log

[program:relay-reverb]
process_name=%(program_name)s
command=php /var/www/relay/artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/relay/storage/logs/reverb.log
```

Update and start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### Step 7: Configure Nginx & SSL
Create `/etc/nginx/sites-available/relay.conf`:
```nginx
server {
    listen 80;
    server_name relay.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name relay.yourdomain.com;
    root /var/www/relay/public;

    # SSL configuration (Certbot will manage certificate paths)
    ssl_certificate /etc/letsencrypt/live/relay.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/relay.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    index index.php index.html;
    charset utf-8;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Client upload size limit
    client_max_body_size 64M;

    # Static Vite build assets
    location ~* ^/build/.*\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri =404;
    }

    # Inertia SPA routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # WebSocket Proxy for Reverb
    location /app {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    location /apps {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # PHP-FPM execution
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site, obtain SSL certificates via Certbot, and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/relay.conf /etc/nginx/sites-enabled/
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d relay.yourdomain.com
sudo systemctl reload nginx
```

---

## 5. Post-Installation Verification with Relay Doctor

Relay Studio includes an integrated system diagnostic command that verifies every critical dependency, socket, file permission, and security flag.

Run this check anytime after installation or configuration changes:

```bash
# On Bare-Metal VPS:
php artisan relay:doctor

# On Docker Compose:
docker compose exec app php artisan relay:doctor
```

Expected diagnostic output:
```text
====================================================================
              RELAY STUDIO SYSTEM & DEPLOYMENT DOCTOR               
====================================================================
Verifying environment prerequisites, system extensions, and services...

+-------------------+----------------------------+--------+------------------------------------------+
| Component         | Check                      | Status | Details                                  |
+-------------------+----------------------------+--------+------------------------------------------+
| Runtime           | PHP Version                | PASS   | v8.4.x (>= 8.2.0 supported)             |
| PHP Extension     | pdo                        | PASS   | Installed                                |
| PHP Extension     | mbstring                   | PASS   | Installed                                |
| PHP Extension     | gd                         | PASS   | Installed                                |
| PHP Extension     | zip                        | PASS   | Installed                                |
| PHP Extension     | redis                      | PASS   | Installed                                |
| Database          | Connectivity & Schema      | PASS   | Connected to 'mysql'. 28 tables verified |
| Cache & Queues    | Redis Server Ping          | PASS   | Redis responded PONG                     |
| Storage           | /storage/app/public        | PASS   | Directory writable (0775)                |
| Frontend          | Vite Production Manifest   | PASS   | public/build/manifest.json verified      |
| Security          | APP_KEY Persistence        | PASS   | Valid 32-byte cipher key active          |
| Security          | APP_DEBUG Status           | PASS   | Production debug disabled                |
+-------------------+----------------------------+--------+------------------------------------------+

Diagnostics complete: 16 passed, 0 warnings, 0 failures.
Stack health: 100% — System ready for commercial production traffic.
```

Your Relay Studio workspace is now online and ready for team collaboration and autonomous AI agent connections.
