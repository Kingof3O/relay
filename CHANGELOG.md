# Changelog

All notable changes to Relay Studio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-26 — Commercial Production Release

This release marks the inaugural commercial production release of **Relay Studio**, the self-hosted agile workspace engineered for modern software engineering teams and autonomous AI coding agents.

### Added

#### Autonomous AI & Model Context Protocol (MCP)
* **First-Party MCP Server (`@relay/mcp-server`):** Standard stdio JSON-RPC 2.0 server bridging AI coding environments directly to Relay Studio workspaces.
* **The Morning Catch-Up Tool (`relay_get_daily_briefing`):** Instant morning digest providing urgent blockers, overnight tickets, active sprint velocity, and unread team notifications in a single roundtrip.
* **Bi-Directional Action Tools:** Support for task queries (`relay_list_tasks`), detailed inspections (`relay_get_task`), optimistic board moves (`relay_update_task`), ticket creation (`relay_create_task`), and discussion updates (`relay_add_comment`, `relay_list_comments`).
* **Sprint & Project Introspection:** Direct agent visibility into active cycles (`relay_get_active_cycle`) and workspace project trees (`relay_list_projects`).
* **Turnkey IDE Configs:** Copyable configuration snippets for Cursor, Claude Desktop, Antigravity, and Windsurf.

#### Agile Sprint Cycles & Delivery Engine
* **Automated Cycle Rollover (`relay:cycle-rollover`):** Scheduled, idempotent sprint rollover engine moving incomplete tickets forward while archiving completed iterations.
* **Dynamic Burndown Analytics:** Interactive sprint burndown visualization tracking ideal vs. actual remaining story points.
* **Historical Velocity Tracking:** Continuous velocity calculations across delivered iterations for sprint capacity planning.
* **Quarterly Roadmaps (`/roadmap`):** High-level roadmap timeline grouping issues by target release horizons.

#### Interface & Keyboard-First Ergonomics
* **Optimistic Kanban Board:** Drag-and-drop status workflows (`@hello-pangea/dnd`) across `new`, `ready`, `doing`, `review`, and `done` with automatic rollback on network failure.
* **Global Command Palette (`⌘K` / `Ctrl+K`):** Sub-second fuzzy search across issues, projects, cycles, and navigation targets.
* **Vim Navigation Shortcuts:** Full list and board navigation via `j` (down), `k` (up), `Enter` (open), `c` (new issue), and `Esc` (dismiss).
* **Instant Slideout Drawers:** Context-preserving ticket detail inspection and attribute editing directly from the Kanban view.
* **Rich Markdown Editor:** TipTap-powered editor with syntax highlighting, bullet/task lists, and inline asset previews.

#### Real-Time Collaboration & WebSockets
* **Laravel Reverb WebSocket Integration:** Sub-second live presence indicators showing active viewers and editors.
* **Live Board Synchronization:** Instant multi-user card movement without page refreshes.
* **Activity Badge Feeds:** Instant notification counts and discussion badges.

#### Enterprise Security & Multi-Tenancy
* **Workspace Isolation:** Strict tenant boundaries enforced across all queries, search indices, and API controllers.
* **Role-Based Access Control (RBAC):** Five distinct workspace roles: `Owner`, `Admin`, `Developer`, `Designer`, and `Member`.
* **Two-Factor Authentication (2FA):** Time-based One-Time Passwords (TOTP via Google Authenticator, 1Password) with emergency recovery codes.
* **Sanctum Personal Access Tokens (PAT):** Scoped REST API tokens (`requests:read`, `requests:write`, `comments:write`, `*`) with instant revocation.
* **Immutable Audit Trail:** Comprehensive activity logging in `workspace_audits` capturing before/after diffs for all mutations.
* **Outgoing Webhook SSRF Guard:** Strict URL validation and RFC1918 private network filtering on outgoing webhook dispatchers.

#### DevOps & Disaster Recovery
* **Turnkey 1-Command Installer (`scripts/install.sh`):** Automated script setting up Docker Compose, generating cryptographic keys, migrating schemas, and initializing workspaces.
* **Integrated Disaster Recovery (`relay:backup` & `relay:restore`):** Automated SQL database dumps and attachment ZIP packaging with customizable retention pruning (`RELAY_BACKUP_RETENTION_DAYS`).
* **System Diagnostic Doctor (`relay:doctor`):** Comprehensive CLI tool auditing PHP version, required extensions, database latency, Redis health, file permissions, and security flags.
* **Production Docker Stack:** Multi-container orchestration (`app`, `db`, `redis`, `mailpit`) with Nginx reverse proxy, Supervisord process supervision, and healthchecks.
* **Multi-Database Support:** Tested compatibility with MySQL 8.4, PostgreSQL 15/16, and SQLite 3.

#### Integrations
* **GitHub Push Webhook:** Auto-closes linked tickets (`fixes #REQ-104`) with HMAC SHA-256 signature verification.
* **Discord & Slack Webhooks:** Configurable channel embeds on issue creation, assignment, and cycle rollover.
* **Inbound Email Processing:** Webhook endpoint for ingesting MIME email tickets from SendGrid, Mailgun, and Postmark.

### Quality & Verification Benchmarks
* **Automated Test Suite:** 251 feature and unit tests passing with 1,256 assertions.
* **PHPStan Static Analysis:** Passing at Level Max (highest strictness) with 0 errors across 135 files.
* **TypeScript Type Safety:** Strict `tsc --noEmit` validation passing with 0 errors.
* **Code Styling:** 100% compliant with Laravel Pint PSR-12 formatting standards.

[1.0.0]: https://github.com/Kingof3O/relay/releases/tag/v1.0.0
