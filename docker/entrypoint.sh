#!/bin/sh
set -e

echo "=========================================================="
echo " Starting Relay Studio Production Environment"
echo "=========================================================="

# Ensure storage directories exist with appropriate permissions
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/app/public \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache \
         /var/log/supervisor \
         /var/run/nginx

chown -R relay:relay /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Verify application key
if [ -z "$APP_KEY" ]; then
    if [ "$APP_ENV" = "production" ]; then
        echo "=========================================================="
        echo " FATAL CONFIGURATION ERROR:"
        echo " APP_KEY environment variable is NOT set in production!"
        echo " Generating an ephemeral key would corrupt database encryption"
        echo " (2FA secrets, tokens, encrypted fields) on next container restart."
        echo " Generate a persistent key with 'php artisan key:generate --show'"
        echo " and set APP_KEY in your environment or docker-compose.yml."
        echo "=========================================================="
        exit 1
    else
        echo "==> APP_KEY is empty in development. Generating temporary key..."
        export APP_KEY=$(php /var/www/html/artisan key:generate --show)
    fi
fi

# Ensure storage symlink exists
if [ ! -L /var/www/html/public/storage ]; then
    php /var/www/html/artisan storage:link || true
fi

# Run pending database migrations
echo "==> Running database migrations..."
php /var/www/html/artisan migrate --force --isolated || echo "==> Migrations could not run (database may still be initializing or unavailable)."

# Optimize caches in production
if [ "$APP_ENV" = "production" ]; then
    echo "==> Caching Laravel configuration, routes, and views..."
    php /var/www/html/artisan config:cache || true
    php /var/www/html/artisan route:cache || true
    php /var/www/html/artisan view:cache || true
fi

echo "==> Starting Supervisord (Nginx + PHP-FPM + Queue Worker + Scheduler)..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
