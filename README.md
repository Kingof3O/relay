<div align="center">

# ⚡ Relay Studio

### The Open-Source, High-Velocity Engineering & Delivery Engine

**Streamlined issue triage, sub-second cycle velocity, and keyboard-first productivity built for modern engineering teams.**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![PHP](https://img.shields.io/badge/PHP-8.4%2B-777BB4?logo=php&logoColor=white)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

[Quickstart](#-quickstart-in-3-steps) • [Docker Stack](#-production-docker-deployment) • [Features](#-feature-highlights) • [CLI Wizard](#-turnkey-cli-installation--doctor) • [REST API & Webhooks](#-api--webhooks) • [Contributing](#-contributing)

<br/>

<a href="https://railway.app/template/new" target="_blank"><img src="https://railway.app/button.svg" alt="Deploy on Railway" height="30"/></a>
&nbsp;
<a href="https://render.com/deploy" target="_blank"><img src="https://render.com/images/deploy-to-render-button.svg" alt="Deploy to Render" height="30"/></a>

</div>

<br/>

## 🎯 Vision

Relay Studio is an open-source, self-hostable project management and issue delivery system inspired by the precision and craftsmanship of Linear. Engineered with Laravel 13, React 19, and Inertia SPA architecture, Relay delivers sub-second page transitions, keyboard-first navigation, and zero-bloat workflows for studios and software teams.

---

## ⚡ Feature Highlights

| Capability | Description |
| :--- | :--- |
| **Linear-Grade Triage & Kanban** | Drag-and-drop Kanban boards with optimistic status transitions, swimlanes, and rapid triage inbox. |
| **Sub-Second Delivery Velocity** | SPA reactivity with Inertia.js, pre-rendered server hydration, and zero layout shifting. |
| **Tags, Due Dates & Dependencies** | Flexible taxonomy, milestone tracking, blocking dependency indicators, and priority matrices. |
| **⌘K Command Palette & Vim Keys** | Global command launcher, quick ticket creation, instant search, and `j`/`k`/`Enter` keyboard navigation. |
| **Media & Document Pipeline** | Drag-and-drop asset management, WebP image conversion, secure attachment storage, and markdown previews. |
| **Audit Trails & Notifications** | Granular activity tracking, chronological discussion threads, and instant mail notifications via Mailpit / SMTP. |
| **Turnkey Self-Hosting** | Multi-stage production `Dockerfile`, turnkey `docker-compose.yml`, and interactive CLI installer. |

---

## 🚀 Quickstart in 3 Steps

Get Relay running locally in less than 2 minutes using Docker:

```bash
# 1. Clone repository
git clone https://github.com/relay-studio/relay.git
cd relay

# 2. Launch production stack (App, MySQL, Redis, Mailpit)
docker compose up -d

# 3. Open in your browser
open http://localhost:8080
```

> [!TIP]
> The default Docker stack provisions:
> - **Web Application**: `http://localhost:8080`
> - **Mailpit Email Inspector**: `http://localhost:8025`
> - **MySQL 8.4 Server**: `localhost:3306`
> - **Redis 7 Cache / Queue**: `localhost:6379`

---

## 🛠️ Turnkey CLI Installation & Doctor

Relay includes interactive management commands designed for self-hosters and DevOps teams.

### 1. Interactive Installer (`relay:install`)
Configure database connections, generate security keys, migrate tables, and configure your initial administrator account:

```bash
php artisan relay:install
```

```text
  ██████╗ ███████╗██╗      █████╗ ██╗   ██╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
  ██╔══██╗██╔════╝██║     ██╔══██╗╚██╗ ██╔╝    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
  ██████╔╝█████╗  ██║     ███████║ ╚████╔╝     ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
  ██╔══██╗██╔══╝  ██║     ██╔══██║  ╚██╔╝      ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
  ██║  ██║███████╗███████╗██║  ██║   ██║       ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
  ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 

   INFO  Step 1/5: Checking Environment Configuration (.env).  
   INFO  Step 2/5: Application Branding & Access URL.  
   INFO  Step 3/5: Database Connectivity & Migrations.  
   INFO  Step 4/5: Initial Administrator / Owner Setup.  
   INFO  Step 5/5: Workspace Demonstration Data.  
```

For non-interactive or automated CI/CD deployments:
```bash
php artisan relay:install --force --no-seed --admin-name="Admin" --admin-email="admin@relay.studio" --admin-password="secretpassword"
```

### 2. Stack Diagnostics (`relay:doctor`)
Verify system prerequisites, required PHP extensions, database connectivity, cache stores, directory permissions, and compiled assets:

```bash
php artisan relay:doctor
```

```text
+------------+----------------------------+--------+------------------------------------------------------+
| Component  | Diagnostic Check           | Status | Details                                              |
+------------+----------------------------+--------+------------------------------------------------------+
| Runtime    | PHP Version                | ✔ PASS | v8.3.17 (>= 8.2.0 supported)                         |
| Extension  | ext-pdo                    | ✔ PASS | Loaded (Database abstraction layer)                  |
| Extension  | ext-mbstring               | ✔ PASS | Loaded (Multibyte string processing)                 |
| Extension  | ext-gd                     | ✔ PASS | Loaded (Image processing & thumbnails)               |
| Extension  | ext-zip                    | ✔ PASS | Loaded (Archive processing & export packaging)       |
| Extension  | ext-redis                  | ✔ PASS | Loaded (phpredis)                                    |
| Database   | Connection                 | ✔ PASS | mysql (db: relay, server: 8.4.0)                     |
| Database   | Migrations                 | ✔ PASS | Verified (21 migrations executed)                    |
| Cache      | Driver [redis]             | ✔ PASS | Read/write test passed                               |
| Filesystem | storage/framework          | ✔ PASS | Directory exists and is writable                     |
| Frontend   | Vite Build Manifest        | ✔ PASS | public/build/manifest.json present                   |
| Security   | Application Key            | ✔ PASS | APP_KEY configured                                   |
+------------+----------------------------+--------+------------------------------------------------------+
```

---

## 🐳 Production Docker Deployment

Relay provides a multi-stage production Docker container:

- **Stage 1 (Frontend)**: Node 20 Alpine compiles client and SSR assets.
- **Stage 2 (Vendor)**: Composer installs optimized production dependencies.
- **Stage 3 (Runtime)**: Alpine PHP 8.3 FPM + Nginx + Supervisord (running PHP-FPM, Nginx, and queue workers concurrently).

### Deploying with Docker Compose:
```bash
# Build and run containers in background
docker compose up -d --build

# View container logs
docker compose logs -f app

# Run migrations inside the container
docker compose exec app php artisan migrate

# Stop services
docker compose down
```

---

## 💻 Local Development Setup

If you prefer developing on macOS/Linux using Herd, Valet, or native PHP:

```bash
# 1. Clone and install backend dependencies
git clone https://github.com/relay-studio/relay.git
cd relay
composer install

# 2. Setup environment and app key
cp .env.example .env
php artisan key:generate

# 3. Run database migrations & seeders
php artisan migrate --seed

# 4. Install frontend dependencies and start Vite
npm install
npm run dev

# 5. Start Laravel development server
php artisan serve
```

---

## 🔌 API, Tokens & Webhooks

Relay provides a high-performance REST API (v1) and webhook integrations for automation, third-party tooling, and CI/CD pipelines.

### Personal Access Tokens (PAT)
All REST API v1 endpoints are protected using Laravel Sanctum Personal Access Tokens.

1. **Generate Token**: Navigate to **Profile > API Tokens** (`/profile/tokens`) in the web interface and click **Create New Token**.
2. **Authenticate Requests**: Provide the Bearer token in the standard HTTP `Authorization` header:
   ```bash
   curl -H "Authorization: Bearer <your-personal-access-token>" \
        -H "Accept: application/json" \
        http://localhost:8080/api/v1/work-requests
   ```
3. **Revocation**: Tokens can be individually revoked anytime from the web UI.

### REST API v1 Endpoints

| Method | Endpoint | Description | Query / Body Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/search` | Fast global search across issues & projects | `q` (search query) |
| `GET` | `/api/v1/work-requests` | Paginated list of issues with filter criteria | `status`, `priority`, `area_id`, `search`, `page` |
| `POST` | `/api/v1/work-requests` | Create a new work request / issue | `title` (required), `description`, `status`, `priority`, `area_id`, `assignee_id`, `story_points`, `due_date`, `tags` |
| `GET` | `/api/v1/work-requests/{id}` | Retrieve complete issue details with relations, subtasks, activities & attachments | `{id}` (issue ID) |
| `PATCH` | `/api/v1/work-requests/{id}` | Update issue properties | `title`, `description`, `status`, `priority`, `area_id`, `assignee_id`, `story_points`, `due_date`, `tags` |
| `DELETE` | `/api/v1/work-requests/{id}` | Soft-delete a work request | `{id}` (issue ID) |
| `GET` | `/api/v1/projects` | List all active workspace areas / projects | — |

### GitHub Push & Commit Auto-Close
Relay automatically associates commits and transitions referenced tickets when git push events occur:
- Push payload endpoint: `POST /api/webhooks/github` (supports HMAC SHA-256 signature via `GITHUB_WEBHOOK_SECRET`)
- Commit message syntax: `fixes REQ-104` or `closes #REQ-104`

### Inbound Email Webhook
Create new issues directly via inbound email ingestion:
- Endpoint: `POST /api/webhooks/inbound-email` (supports SendGrid, Mailgun, and raw MIME formats)

---

## 🧪 Testing & Code Quality

Run tests and style checks locally:

```bash
# Execute PHPUnit / Pest test suites
php artisan test

# Run Laravel Pint code styling
./vendor/bin/pint --test

# Type-check TypeScript & build frontend
npm run build
```

---

## 🤝 Contributing

Contributions are welcomed and celebrated! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our workflow, issue conventions, and pull request guidelines.

---

## 🔒 Security

For security vulnerability disclosure, please refer to [SECURITY.md](SECURITY.md).

---

## 📄 License

Relay Studio is open-source software licensed under the [Apache License, Version 2.0](LICENSE).
