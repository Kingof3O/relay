# Relay Studio — Commercial Marketing Copy & Product Messaging

This document contains production-ready marketing copy, positioning frameworks, pricing breakdowns, and buyer objection handlers for the Relay Studio landing page, Lemon Squeezy storefront, and product launches.

---

## 1. Hero Messaging & Headlines

### Primary Headline
> **The Self-Hosted Workspace for Software Teams and AI Coding Agents.**

### Primary Subheadline
> Linear-inspired velocity, complete data sovereignty, and native Model Context Protocol (MCP) integration. Pay once, self-host forever, and never pay per-seat SaaS taxes again.

### Alternative Variant Headlines (A/B Testing)
* **Performance Focus:** *"The Sub-Second Issue Tracker Built for Developers Who Live on the Keyboard."*
* **AI & Agent Focus:** *"The First Project Management Workspace Built for Humans and Autonomous AI Coding Agents."*
* **Sovereignty & Cost Focus:** *"Ditch Cloud SaaS Subscriptions. Take Full Ownership of Your Engineering Roadmap."*

### Key Value Badges (Storefront Callouts)
* ⚡ **Sub-100ms Latency** (Inertia.js + React 19 + Laravel 13)
* 🤖 **First-Party Native MCP Server** (Antigravity, Cursor, Claude Desktop, Windsurf)
* 🛡️ **100% Data Sovereignty** (Zero Telemetry, GDPR / HIPAA Ready)
* 💳 **Pay Once, Self-Host Indefinitely** (Zero Per-Seat Monthly Fees)
* 📦 **Complete Un-Obfuscated Source Code Included**

---

## 2. The Three Core Value Propositions

### Value Proposition 1: Sub-Second Interface Velocity With Keyboard Ergonomics
* **The Problem:** Modern project management tools have become bloated web applications taking 2 to 4 seconds to open an issue or transition a board card. Developers resent the latency and retreat to disconnected text files.
* **The Relay Solution:** Built on Inertia.js 3, React 19, and Tailwind CSS 4, Relay Studio eliminates full-page reloads. Transitions feel instantaneous. Combined with a global `⌘K` command launcher, fuzzy search, and Vim navigation keys (`j`, `k`, `Enter`, `c`), your team can triage, assign, and organize sprints without touching the mouse.

### Value Proposition 2: Built-in Model Context Protocol (MCP) for Autonomous Coding Agents
* **The Problem:** AI coding assistants (like Cursor, Claude Desktop, and Antigravity) are trapped inside individual files. They don't know what's in your sprint backlog, what dependencies are blocking PRs, or what was delivered overnight.
* **The Relay Solution:** Relay Studio ships with a first-party `@relay/mcp-server`. Your agent starts the morning with a full briefing of blockers and active tickets (`relay_get_daily_briefing`), moves Kanban cards across stages as tests pass (`relay_update_task`), and writes technical summaries on completion (`relay_add_comment`).

### Value Proposition 3: Complete Data Sovereignty & Radical Cost Predictability
* **The Problem:** Commercial SaaS trackers charge $8 to $16 per engineer every month. For a 25-person team, that's $2,400 to $4,800 every single year for basic task tracking—while proprietary roadmap specs and bug reports sit in third-party clouds.
* **The Relay Solution:** Relay Studio installs on your own private VPS, bare metal, or Docker cluster. You retain 100% data ownership with zero external tracking. With one-time licensing, you pay once and enjoy unlimited users with zero per-seat bills.

---

## 3. Competitive Comparison Table

| Dimension | ⚡ Relay Studio | 📐 Linear | 🐘 Atlassian Jira | ✈️ Plane |
| :--- | :---: | :---: | :---: | :---: |
| **Hosting & Control** | **100% Self-Hosted & Sovereign** | Cloud Only (SaaS) | Cloud Only (Server EOL) | Self-Hosted / Cloud |
| **Pricing for 20 Engineers (Year 1)** | **$299 (One-time)** | $1,920 – $3,840 / year | $1,956 – $3,840 / year | $1,920 / year (Cloud) |
| **Pricing for 20 Engineers (Year 3)** | **$299 Total** | $5,760 – $11,520 | $5,868 – $11,520 | $5,760 |
| **Native 1st-Party MCP Server** | **Yes (`@relay/mcp-server`)** | No (3rd-Party REST only) | No (Forge Plugin only) | No |
| **Average Page Latency** | **< 100 ms (Inertia SPA)** | < 100 ms | 1,200 ms – 3,500 ms | 300 ms – 800 ms |
| **Keyboard Ergonomics** | **`⌘K` + Full Vim Shortcuts** | `⌘K` + Shortcuts | Limited Shortcuts | Basic Shortcuts |
| **Real-Time Presence** | **Included (Reverb WebSockets)** | Proprietary Sync | Polling / Delays | WebSockets |
| **Automated Sprint Rollover** | **Built-in CLI (`relay:cycle-rollover`)** | Native Cycles | Complex Manual Sprint Config | Sprints Module |
| **Disaster Recovery Tools** | **Built-in (`relay:backup`/`restore`)** | JSON export | Manual Add-on | Docker Dump |
| **Memory Footprint** | **~180 MB RAM** | Closed SaaS | 4 GB – 8 GB RAM min | 1.5 GB – 3 GB RAM |
| **Telemetry & Tracking** | **Zero Phone-Home / Air-Gappable** | Proprietary Analytics | PII & Usage Profiling | Telemetry opt-out |
| **Source Code Access** | **Complete Un-Obfuscated Source** | Closed Source | Closed Source | Core Open Source |

---

## 4. Commercial Pricing Tiers Breakdown

```text
+-----------------------+-----------------------+-----------------------+
|       SOLO TIER       |       TEAM TIER       |      AGENCY TIER      |
|         $149          |         $299          |         $599          |
|   One-time purchase   |   One-time purchase   |   One-time purchase   |
+-----------------------+-----------------------+-----------------------+
| • 1 Production Inst.  | • 1 Production Inst.  | • Up to 5 Prod. Inst. |
| • 1 User Seat         | • UNLIMITED Seats     | • UNLIMITED Seats     |
| • Full Source Code    | • Unlimited Dev/Stage | • 5 Client Installs   |
| • Native MCP Server   | • Real-Time Reverb WS | • White-Label Rights  |
| • 1 Year of Updates   | • Discord/Slack Hooks | • Custom Branding     |
| • Turnkey Docker      | • Auto Sprint Engine  | • Priority Support    |
| • 14-Day Guarantee    | • 1 Year of Updates   | • 1 Year of Updates   |
+-----------------------+-----------------------+-----------------------+
```

### Detailed Tier Summaries

#### Solo License — $149 (One-Time)
* **Who it's for:** Independent developers, freelancers, and solo technical founders.
* **What's included:**
  * Single-user production instance on your own infrastructure.
  * Complete, un-obfuscated PHP, React, and TypeScript source code.
  * Full first-party Model Context Protocol (MCP) server for Cursor, Claude, Antigravity, and Windsurf.
  * Turnkey 1-command installer and automated backup tooling.
  * 12 months of software updates and security patches.

#### Team License — $299 (One-Time) — **Most Popular**
* **Who it's for:** Software engineering teams, dev shops, and growing startups.
* **What's included:**
  * One (1) production instance plus unlimited staging, CI/CD, and local development environments.
  * **Unlimited team members** (No per-seat fees, forever).
  * Real-time Laravel Reverb WebSocket presence and live board synchronization.
  * Two-Factor Authentication (TOTP), Role-Based Access Control (RBAC), and immutable audit logs.
  * Automated sprint cycle rollover (`relay:cycle-rollover`) with burndown and velocity analytics.
  * Discord, Slack, and GitHub push auto-close webhook integrations.
  * 12 months of software updates and security patches.

#### Agency & Enterprise License — $599 (One-Time)
* **Who it's for:** Software agencies, dev consultancies, and multi-team organizations.
* **What's included:**
  * License to deploy up to five (5) distinct production instances (for internal departments or client deliverables).
  * **White-Label Customization:** Remove Relay Studio branding and apply custom agency or client themes, logos, and color schemes.
  * Unlimited user seats across all five instances.
  * Priority email/async technical onboarding and architecture assistance.
  * 12 months of software updates and security patches.

---

## 5. Comprehensive Buyer FAQ

### General & Architecture

#### What are the minimum server requirements to host Relay Studio?
Relay Studio is engineered for minimal resource consumption.
* **Minimum (1–25 users):** 1 vCPU, 2 GB RAM, 15 GB NVMe SSD.
* **Recommended (25–250+ users):** 2–4 vCPUs, 4–8 GB RAM, 40+ GB SSD.
* **Supported Platforms:** Any Linux host with Docker Compose v2, or an Ubuntu 22.04/24.04 VPS running PHP 8.4, Node 22, MySQL 8.4 (or Postgres 15+), and Redis 7.

#### How does the turnkey 1-command installer work?
On a fresh Linux VPS with Docker installed, run:
```bash
curl -fsSL https://get.relay.studio/install.sh | bash
```
The installer checks system dependencies, generates cryptographically secure keys, boots the isolated container cluster, runs schema migrations, establishes your admin account, and audits stack health using `relay:doctor`.

#### Can Relay Studio run on an air-gapped private network?
Yes. Relay Studio has zero phone-home licensing checks and zero external runtime telemetry. Once deployed, the entire application—including database, Redis cache, and Laravel Reverb WebSockets—runs completely self-contained within your private VPC or internal company intranet.

---

### AI & Model Context Protocol (MCP)

#### How do AI agents like Cursor or Claude Desktop connect to Relay?
Relay Studio includes a first-party Node.js MCP server (`@relay/mcp-server`) that implements standard stdio JSON-RPC 2.0. You simply generate a Personal Access Token via the Relay CLI (`php artisan relay:token <username>`) or web profile, add a 5-line JSON definition to your IDE's MCP config, and your AI assistant immediately gains native tools to query sprints, move board cards, and post comments.

#### Can AI agents modify or delete data without permission?
No. Relay Studio enforces strict token ability scoping. You can issue read-only tokens (`requests:read`) for morning catch-up agents, or scoped tokens (`requests:write`, `comments:write`). Furthermore, an AI agent's actions are permanently recorded in the immutable `workspace_audits` log and cannot exceed the workspace role permissions of the user who issued the token.

---

### Licensing, Updates & Support

#### Are there really no monthly per-seat fees?
None. You purchase the software once and deploy it on your own server. Whether you have 5 engineers or 50 engineers on the Team tier, you will never receive a per-user invoice from us.

#### What happens after the 12 months of included updates?
Your license is perpetual. The version you downloaded will continue to run indefinitely on your infrastructure. After 12 months, you can optionally renew access to future feature updates and security patches at a 50% discount. Renewal is completely optional.

#### Do I get access to the actual source code?
Yes. Every customer receives complete, un-obfuscated PHP, React, and TypeScript source code. You are free to inspect the code, add custom integrations, or tailor it to your organization's internal workflows.

#### What is your refund policy?
We offer a **14-day technical deployment guarantee**. If you are unable to successfully deploy and run Relay Studio on a host meeting our minimum system specifications, and our technical support team cannot resolve the deployment issue within three (3) business days, we will issue a full refund.
