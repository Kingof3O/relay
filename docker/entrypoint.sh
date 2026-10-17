#!/bin/sh
set -e

echo "=========================================================="
echo " Starting Relay Studio Production Environment"
echo "=========================================================="

# Ensure storage directories exist with appropriate permissions
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache \
         /var/log/supervisor \
         /var/run/nginx

chown -R relay:relay /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate application key if missing
if [ -z "$APP_KEY" ]; then
    echo "==> APP_KEY is empty. Generating new key..."
    php /var/www/html/artisan key:generate --force
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

echo "==> Starting Supervisord (Nginx + PHP-FPM + Queue Worker)..."
exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
