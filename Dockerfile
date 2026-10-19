# ==========================================
# Stage 1: Frontend Asset Compilation
# ==========================================
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit

COPY resources ./resources
COPY public ./public
COPY vite.config.js tsconfig.json tailwind.config.js postcss.config.js ./

RUN npm run build

# ==========================================
# Stage 2: Composer Production Dependencies
# ==========================================
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-reqs

# ==========================================
# Stage 3: Production Web Server & Runtime
# ==========================================
FROM php:8.4-fpm-alpine AS production

# Install system dependencies
RUN apk update && apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    postgresql-dev \
    sqlite-dev \
    icu-dev \
    oniguruma-dev \
    ffmpeg \
    bash

# Install PHP extensions
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    redis \
    gd \
    zip \
    opcache \
    bcmath \
    intl \
    pcntl \
    exif

# Copy Composer binary
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application source code
COPY . /var/www/html

# Copy pre-built vendor packages and compiled assets
COPY --from=vendor /app/vendor /var/www/html/vendor
COPY --from=frontend /app/public/build /var/www/html/public/build
COPY --from=frontend /app/bootstrap/ssr /var/www/html/bootstrap/ssr

# Copy container configurations
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/relay-production.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

# Create non-root application user and configure directory permissions
RUN addgroup -g 1000 relay && \
    adduser -u 1000 -G relay -D -s /bin/sh relay && \
    mkdir -p /var/www/html/storage/framework/cache/data \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/views \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache \
             /var/log/supervisor \
             /var/run/nginx && \
    chown -R relay:relay /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose HTTP port
EXPOSE 80

# Run entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
