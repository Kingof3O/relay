# Relay Studio — Pre-Production Audit and Production Readiness Decision

**Audit type:** Read-only pre-production review (no application source modified)  
**Repository:** `/Volumes/Main/Herd/stm`  
**Branch:** `main`  
**Audit date:** 19 October 2026  
**Release decision:** **NO-GO**

> This is a new consolidated report. The pre-existing `00-PRODUCTION-READINESS.md` was not written to by this audit and remains in place as a separate consolidation. It references an earlier `B-###` finding set that is not present in the current source reports. This file is the authoritative consolidation of the current `01-backend-audit.md`, `02-frontend-product-audit.md`, `03-security-audit.md`, and `04-qa-deployment-audit.md`.

---

## Provenance and source reconciliation

| Item | Value |
|---|---|
| Backend source | `reports/pre-production/01-backend-audit.md` — `BK-01`…`BK-31` |
| Frontend/product source | `reports/pre-production/02-frontend-product-audit.md` — `F-001`…`F-044` |
| Security source | `reports/pre-production/03-security-audit.md` — `SEC-001`…`SEC-025` |
| QA/deployment source | `reports/pre-production/04-qa-deployment-audit.md` — `QA-001`…`QA-035` |
| Raw findings | **135** |
| Raw severity | **P0: 4 · P1: 39 · P2: 58 · P3: 34** |
| Lead re-rating | `SEC-004` re-rated **P1 → P0** (confirmed cross-tenant read leakage) |
| Consolidated severity | **P0: 5 · P1: 38 · P2: 58 · P3: 34** |
| Application versions | Laravel `13.33.0`, PHP local `8.4.22` (Composer requires `^8.3`), Inertia `3.3.4`, Sanctum `4.3.3`, React `19.3.0`, Vite `8.3.0`, TypeScript `5.9.3`, Tailwind `4.3.3`, PHPUnit `13.3.4` |
| Missing runtime dependencies | `laravel/reverb`, `laravel-echo`, `pusher-js` are **not installed**; there is no `config/reverb.php` or `config/broadcasting.php` |

The backend source report contains an internal priority-table inconsistency (its summary lists 8/11/7; the per-finding labels total 9/12/10). The counts above were computed from the actual per-finding severity labels and independently checked by the Lead.

**Cross-report duplicate map (primary consolidated issues):**

| Consolidated issue | Source IDs |
|---|---|
| Cross-tenant team mutation / self-escalation | `SEC-001`, `BK-01` |
| Demo/default credentials | `F-001`, `SEC-025`, `QA-032` |
| Unauthenticated inbound email | `SEC-002`, `BK-06`, `QA-011` |
| OAuth auto-provisioning to Developer | `SEC-003`, `BK-01` |
| Workspace scoping fails open | `SEC-004`, `BK-09`, `QA-010`, `BK-29` |
| Missing authz on relations/cycles/areas | `SEC-005`, `SEC-006`, `SEC-007`, `BK-03`, `BK-05`, `BK-10` |
| GitHub webhook fail-open | `SEC-009`, `BK-08`, `QA-003` |
| 2FA not enforced at login | `SEC-010`, `BK-07`, `F-008` |
| Invitation POST signature bypass | `SEC-011` |
| SSRF / global webhook config | `SEC-012`, `SEC-013` |
| API authz / PAT scoping | `SEC-014`, `QA-013`, `QA-030`, `BK-23` |
| File-serving stored XSS | `SEC-008` |
| Scheduler / automatic rollover | `BK-02`, `QA-004` |
| Docker storage / APP_KEY | `QA-001`, `QA-005` |
| Video worker timeout | `QA-002`, `QA-020` |
| Realtime/presence | `F-003`, `QA-012` |
| CI red / doctor ordering | `QA-006`, `QA-007` |
| Bulk-action correctness | `F-009`, `F-040` |

---

## A. Executive Summary

### Overall assessment

**Relay Studio is not production ready.** It is a substantial and largely functional application with a strong service layer, broad feature coverage, and a passing 195-test backend suite. However, the product fails fundamental production gates: default credentials are shipped and advertised, tenant isolation fails open, team administration allows cross-tenant mutation and self-escalation, inbound email is unauthenticated, OAuth auto-provisions admin-grade accounts, several authorization surfaces are unprotected, 2FA is not enforced, webhooks fail open, Docker is structurally broken for runtime writes, and production-operational essentials (scheduler, backups, monitoring) are absent.

### Strongest areas

- Service-layer separation, FormRequests, transactions, `DB::afterCommit`, and optimistic locking are used consistently in the core request flows.
- `WorkRequestService`, `CycleService`, `RequestFileService`, `DiscordNotificationService`, and `AuditService` are well-separated units.
- 195 PHPUnit feature tests / 1,055 assertions pass in the test environment.
- Cycle rollover uses row locking (`lockForUpdate`) and re-checks cycle scope, with tests for duplicate rollover and cross-workspace behavior.
- Core Kanban, story points, dependency unblocking, tags/priorities/due dates, roadmap, mentions, notifications, images, exports, OAuth, 2FA enrollment, installer, and doctor are implemented to a meaningful degree.
- TypeScript type-check and the production build both pass; the Docker setup is multi-stage and well-documented.

### Most serious weaknesses

1. **Default/demo credentials are visible and seeded by default** (`F-001`, `SEC-025`, `QA-032`).
2. **Team-member administration is cross-tenant and permits self-escalation** (`SEC-001`, `BK-01`).
3. **Inbound email replies are unauthenticated and impersonate arbitrary users** (`SEC-002`, `BK-06`).
4. **OAuth auto-registration grants the Developer role, which has all 12 permissions** (`SEC-003`).
5. **Workspace scoping fails open for workspace-less accounts and NULL rows** (`SEC-004`, `BK-09`).
6. **Relations, cycles, and areas lack authorization/workspace-scoped route binding** (`SEC-005`, `SEC-006`, `SEC-007`).
7. **Document serving enables stored XSS via `inline` + stored MIME** (`SEC-008`).
8. **GitHub webhooks accept unsigned payloads when no secret is configured** (`SEC-009`, `BK-08`).
9. **2FA is enrollable but never challenged at login** (`SEC-010`, `BK-07`).
10. **Invitation acceptance POST skips signature verification and can overwrite an existing account password** (`SEC-011`).
11. **The scheduler is not configured; automatic cycle rollover never runs** (`BK-02`, `QA-004`).
12. **Docker PHP-FPM runs as `www-data` while storage is `relay:relay`, and `APP_KEY` is regenerated on boot** (`QA-001`, `QA-005`).
13. **CI is red (Pint, doctor ordering), and there are no frontend/E2E tests** (`QA-006`, `QA-007`, `QA-021`).
14. **No backup/restore, monitoring, alerting, or log rotation** (`QA-014`, `QA-015`).

### Release posture

The correct decision is **NO-GO**, not CONDITIONAL GO. Confirmed P0 defects exist in shipped code paths. The lack of runtime verification for Docker, Redis/Reverb, OAuth providers, webhooks, and backup restore further prevents a production confidence claim.

### Audit confidence

- **High:** static code paths, command outcomes, backend test results, TypeScript/lint/build results, dependency audits, route inventory.
- **Medium:** exploitability of confirmed vulnerabilities (not dynamically exploited), capacity/performance at target scale, cycle/burndown mathematical accuracy.
- **Low:** Docker runtime behavior, MySQL 8.4/PostgreSQL/SQLite behavior, Redis/Reverb, real OAuth and webhook delivery, load/concurrency, backup restore, CI execution on the hosted runner.

---

## B. Complete Feature Inventory

**Status definitions**

- **COMPLETE/VERIFIED** — implemented end-to-end, with server behavior covered by PHP tests and client wiring statically traced. No browser E2E exists.
- **PARTIAL** — core works, but a documented requirement, security property, or production behavior is missing or incorrect.
- **BROKEN** — the supported flow fails, or succeeds only by violating a security/data-integrity requirement.
- **IMPLEMENTED/UNVERIFIED** — code/wiring exists but no runtime validation was possible.
- **MISSING** — no implementation found.

**Tested definitions**

- **PHP tests** — Laravel feature/unit coverage exists and passed.
- **Partial tests** — happy-path tests only, or limited coverage.
- **Static** — source/wiring inspected; no browser execution.
- **Command** — command executed directly.
- **Config** — configuration validated only.
- **None** — no test found.

| # | Feature | Status | Backend | Frontend | Tested | Missing Work | Priority |
|---|---|---|---|---|---|---|---|
| 1 | Issue CRUD and relay-style identifiers | PARTIAL | PARTIAL | PARTIAL | PHP tests | Restore/delete parity (`BK-12`); relationship validation on store (`BK-04`, `SEC-015`); quick-create field gaps (`F-031`) | P2 |
| 2 | Kanban board | PARTIAL | VERIFIED | VERIFIED (static) | PHP tests | Swimlanes (`F-037`); board cap/pagination (`QA-009`); N+1 in payload (`BK-19`, `QA-008`); mobile layout (`F-006`) | P2 |
| 3 | List view with filters | PARTIAL | PARTIAL | VERIFIED (static) | PHP tests | True pagination/virtualization (`QA-009`); mobile (`F-006`) | P2 |
| 4 | Optimistic updates with rollback | PARTIAL | VERIFIED | PARTIAL | PHP tests + static | Bulk actions mark success before await (`F-009`); stale `lock_version` in drawer/dashboard (`F-017`, `F-029`, `BK-24`) | P1 |
| 5 | Story points | COMPLETE/VERIFIED | VERIFIED | VERIFIED (static) | PHP tests | None | P3 |
| 6 | Subtasks/nested issues | PARTIAL | PARTIAL | PARTIAL | PHP tests | No nested detail UI (static absence); parent workspace/cycle validation (`BK-04`, `SEC-015`); toggle side effects (`BK-13`) | P1 |
| 7 | Issue dependencies | PARTIAL | PARTIAL | VERIFIED (static) | PHP tests | No transitive cycle prevention (`BK-14`); relation authz/workspace scoping (`SEC-005`, `BK-05`) | P1 |
| 8 | Automatic unblock on completion | COMPLETE/VERIFIED | VERIFIED | VERIFIED (static) | PHP tests | None | P3 |
| 9 | Tags, priorities, due dates | COMPLETE/VERIFIED | VERIFIED | VERIFIED (static) | PHP tests | Due-date timezone/local-date consistency (`F-028`, `F-042`) | P3 |
| 10 | Sprint/cycle management | PARTIAL | VERIFIED | PARTIAL | PHP tests | No create-cycle UI (`F-032`) or assign-to-cycle control (`F-005`); no `cycle_id` sent on create (`F-031`); authz (`SEC-006`, `BK-03`); atomic cycle-number generation (`BK-17`) | P1 |
| 11 | Automatic cycle rollover | PARTIAL | PARTIAL | n/a | Command test | Command exists but is **never scheduled** (`BK-02`, `QA-004`) | P1 |
| 12 | Velocity and burndown | PARTIAL | PARTIAL | VERIFIED (static) | PHP tests | Timezone/date-only comparisons (`F-028`, `F-042`); burndown query/math (`BK-18`) | P2 |
| 13 | Quarterly roadmap/Gantt | COMPLETE/VERIFIED | VERIFIED | VERIFIED (static) | PHP tests | Read-only; chart a11y (`F-025`, `F-035`) | P3 |
| 14 | Command palette | PARTIAL | VERIFIED | PARTIAL | No JS tests | Esc does not close palette (`F-026`); dead shortcuts (`F-014`, `F-015`); hardcoded personas (`F-012`) | P2 |
| 15 | Keyboard-first navigation | PARTIAL | n/a | PARTIAL | None | Shortcuts not reliably bound; no cheat sheet; focus management gaps (`F-016`, `F-025`, `F-026`, `F-027`) | P2 |
| 16 | Optimistic locking / conflict review | PARTIAL | VERIFIED | PARTIAL | PHP tests + static | Server `409` works; client `lock_version` not sent consistently; 409 UI/refetch missing (`F-017`, `F-029`, `BK-24`) | P1 |
| 17 | Server-side undo | PARTIAL | VERIFIED | PARTIAL | PHP tests + static | Undo failure not rolled back (`F-009`); duplicate Escape listener (`F-016`); text cleared before success (`F-018`); double PATCH (`F-020`) | P2 |
| 18 | Markdown and syntax highlighting | PARTIAL | PARTIAL | PARTIAL | No JS tests | Limited Markdown renderer; no links/tables/italics; no highlighted code blocks (`F-019`) | P3 |
| 19 | Live presence indicators | BROKEN | MISSING transport | BROKEN | None | No Reverb/Echo/Pusher; UI still shows "1 viewing now" (`F-003`, `QA-012`) | P1 |
| 20 | @mentions and notifications | COMPLETE/VERIFIED | VERIFIED | PARTIAL | PHP tests | Keyboard-inaccessible mention listbox (`F-025`); notification read/unread errors swallowed (`F-041`) | P2 |
| 21 | File upload, conversion, preview | PARTIAL | PARTIAL | PARTIAL | Partial tests | Retry route missing (`F-002`); inline serving XSS (`SEC-008`); video killed by worker timeout (`QA-002`, `QA-020`); upload limits/memory mismatch (`QA-018`) | P1 |
| 22 | REST API v1 | PARTIAL | PARTIAL | n/a | PHP tests | Status/assign permission parity (`SEC-014`, `QA-030`); token abilities ignored (`QA-013`); workspace selector absent (`BK-23`); throttling/error shapes | P1 |
| 23 | Personal access tokens | PARTIAL | PARTIAL | PARTIAL | PHP tests | Abilities/expiry not enforced (`SEC-014`); no `/profile/tokens` UI; controller returns JSON (`F-011`) | P1 |
| 24 | Inbound email replies | BROKEN | UNSAFE | n/a | Partial tests | No signature/auth; sender identity from payload (`SEC-002`, `BK-06`); rate limiting (`QA-011`) | P0 |
| 25 | GitHub commit/PR sync | PARTIAL | PARTIAL | n/a | PHP tests | Signature skips when secret absent (`SEC-009`, `BK-08`); repo/workspace binding; delivery ID idempotency; throttling (`QA-003`) | P1 |
| 26 | Slack/Discord notifications | PARTIAL | PARTIAL | PARTIAL | Discord tests | Native Slack integration missing (generic webhook branch only); per-workspace webhook/SSRF (`SEC-012`, `SEC-013`) | P1 |
| 27 | CSV/JSON exports | COMPLETE/VERIFIED | VERIFIED | VERIFIED (static) | PHP tests | CSV formula injection (`SEC-017`); export authorization review | P2 |
| 28 | Workspace isolation and switching | BROKEN | BROKEN | PARTIAL | Happy-path tests | Global roles; NULL-workspace fail-open; `orWhereNull`; no cross-workspace scoping (`SEC-001`, `SEC-004`, `BK-01`, `BK-09`, `BK-29`) | P0 |
| 29 | Invitations and role management | PARTIAL | PARTIAL | PARTIAL | Invite tests | POST signature bypass (`SEC-011`); global roles (`BK-01`); no invite/remove UI (`F-022`) | P1 |
| 30 | Audit logging | PARTIAL | PARTIAL | PARTIAL | Basic tests | No `workspace_id`; incomplete coverage; no immutability/retention (`SEC-016`) | P2 |
| 31 | Two-factor authentication | BROKEN | BROKEN | PARTIAL | Enrollment tests | Login challenge absent; recovery codes unusable at login; disable/regenerate only `auth`; UI falsely claims enforced (`SEC-010`, `BK-07`, `F-008`) | P1 |
| 32 | Google/GitHub OAuth | PARTIAL | FUNCTIONAL / INSECURE | VERIFIED (static) | Tests pass | Auto-provisions Developer with all permissions and no workspace; enabled by default in `.env.example`; no verified-email/linking guard (`SEC-003`) | P0 |
| 33 | Docker deployment | BROKEN | IMPLEMENTED | n/a | Config only | FPM `www-data` vs `relay:relay` storage (`QA-001`); ephemeral `APP_KEY` (`QA-005`); no scheduler; weak compose defaults (`QA-017`); healthcheck/hardening (`QA-028`) | P1 |
| 34 | Interactive installer | PARTIAL | VERIFIED | n/a | Skip-migrate test | Seed defaults to yes; admin password defaults to `password`; demo seed in production path (`F-001`, `SEC-025`, `QA-032`) | P1 |
| 35 | Health diagnostics | PARTIAL | VERIFIED | n/a | Command (23 pass / 1 warn / 0 fail) | No scheduler/queue/webhook/key checks; CI runs before migrate (`QA-007`); Redis warning (command observation) | P2 |

### Additional production capabilities

| # | Capability | Status | Missing Work | Priority |
|---|---|---|---|---|
| 36 | Password reset | MISSING | No routes, controller, or UI (`F-007`) | P1 |
| 37 | Email verification | MISSING | No verification flow for email changes or OAuth signup (`SEC-021`) | P2 |
| 38 | Backup and restore | MISSING | No DB/storage backup, retention, encryption, or restore drill (`QA-014`) | P1 |
| 39 | Monitoring, alerting, log rotation | MISSING | No error tracking, queue/worker alerts, disk/DB metrics, or rotation (`QA-015`) | P2 |
| 40 | WebSocket transport | MISSING | No Reverb/Echo/Pusher package or broadcast config (`F-003`, `QA-012`) | P1 |
| 41 | Rate limiting / abuse controls | PARTIAL | Only login throttled; API, invitations, webhooks, search unthrottled (`SEC-020`) | P2 |
| 42 | TLS, proxy, security headers | PARTIAL | No HSTS/CSP/frame-ancestors/secure-cookie/TrustProxies config (`QA-016`, `SEC-019`) | P1 |
| 43 | Responsive/mobile UI | MISSING | Fixed 256px sidebar, no hamburger, wide tables (`F-006`) | P1 |
| 44 | Accessibility | PARTIAL | Missing labels, focus traps, keyboard handlers, ARIA (`F-025`, `F-026`, `F-027`, `F-035`) | P2 |
| 45 | Frontend automated tests | MISSING | No Vitest/RTL/Playwright configured (`QA-021`) | P2 |
| 46 | Static analysis / CI gates | PARTIAL | Pint fails; no PHPStan; no frontend tests; no CI security/static gates (`QA-006`, `QA-024`, `QA-034`) | P1 |
| 47 | Search indexing/performance | PARTIAL | LIKE `%term%`; no FULLTEXT/Scout; N+1 in payload (`QA-019`, `BK-19`) | P2 |
| 48 | Active sessions management | MISSING | No session list/revoke UI or routes (`SEC-023`) | P2 |
| 49 | Audit immutability/retention | MISSING | No append-only guarantees or retention policy (`SEC-016`) | P2 |
| 50 | API documentation/OpenAPI | MISSING | Manual route list only | P3 |
| 51 | Data import/migration | MISSING | No importer or migration tooling | P3 |
| 52 | Swimlanes / milestones | MISSING | README claims both; neither exists (`F-037`) | P3 |
| 53 | Bulk edit/delete/tag/cycle | PARTIAL | Only status/priority/assignee bulk actions (`F-009`, `F-040`) | P2 |
| 54 | Nested comments / edit-delete | MISSING | Flat comments only; no edit/delete UI (static absence) | P3 |
| 55 | Saved filters / configurable grouping | MISSING | Fixed filters, no persistence/group-by (`F-043`) | P3 |
| 56 | Offline support | MISSING | No service worker/offline queue (static absence) | P3 |

---

## C. Missing Features

### C1. Entirely missing features (documented or production-essential)

| Feature | Evidence | Impact |
|---|---|---|
| Swimlanes | `README.md:40`; no board swimlane implementation | A documented Kanban view is absent |
| Milestone tracking | `README.md:42`; no milestone model/table/UI | A documented roadmap capability is absent |
| Live presence transport | `README.md:38`; no `laravel/reverb`, `laravel-echo`, or `pusher-js`; no broadcast config | Real-time presence cannot work; UI is misleading |
| Password reset | `routes/auth.php` has no reset routes/controller/UI | Users cannot recover accounts |
| Email verification | No verification routes/controller/UI | Email ownership is never proven; affects account linking/notifications |
| Backups/restore | No backup command, schedule, retention, or documentation | No recoverability from data loss |
| Monitoring/alerting/log rotation | No Sentry/Telescope/Pulse, alerting, or rotation | Failures are invisible; logs can fill disk |
| Native Slack integration | No Slack service/settings; only a generic outgoing-webhook payload branch (`DispatchOutgoingWebhook`) and unused `services.slack` keys | Native Slack notifications are absent |
| Mobile/responsive shell | Fixed sidebar, no menu toggle, wide tables | The product is effectively unusable on phones |
| Frontend test harness | No Vitest/RTL/Playwright configuration | UI regressions are untested |
| PHPStan/analysis gate | CI has no static-analysis step | Type/logic regressions are not gated |
| Active sessions management | No session listing/revocation | Users cannot inspect or revoke sessions |
| Audit immutability/retention | No append-only enforcement or retention policy | Audit evidence can be altered/deleted |
| API documentation | No OpenAPI/route docs | API consumers lack a contract |

### C2. Partially implemented documented features

| Feature | What exists | What is missing |
|---|---|---|
| Issue CRUD | Full CRUD on the server, identifiers, relationships | No dedicated create route; restore/delete semantics differ between UI and backend; store lacks full relationship validation |
| Kanban | Drag/drop, columns, WIP counts, optimistic updates | No swimlanes; hard cap/pagination; N+1 payload; mobile layout |
| List view | Filterable table with sorting | No true pagination/virtualization; no saved filters |
| Optimistic updates | Client store and server `updated_at`/`lock_version` support | Bulk actions, the drawer, and dashboard do not send `lock_version`; 409 recovery UI is inconsistent |
| Subtasks | `parent_id`, self-parent guard, list count | No nested detail UI; parent workspace/cycle not validated; toggle does not update parent status |
| Dependencies | Blocked-by links, cycle guard, auto-unblock | No transitive cycle detection; relation endpoints lack authorization and workspace-scoped binding |
| Cycles | CRUD, active cycle, rollover command, lock | No create-cycle UI; no assign-to-cycle UI; `cycle_id` not sent on create; authz gaps; non-atomic cycle numbers |
| Velocity/burndown | Calculations and charts | Date-only/timezone comparisons distort points; scope changes not fully modeled; inefficient queries |
| Command palette | Search, issue navigation, shortcuts | Esc does not close the palette; cycle shortcuts call missing methods; hardcoded persona list |
| Keyboard navigation | Partial shortcuts and focus styles | No reliable global bindings; no cheat sheet; modal focus restoration gaps |
| Markdown | TipTap editor and limited viewer | No full Markdown/syntax highlighting; viewer supports only a small subset |
| File pipeline | Upload, image preview/thumbnail, extraction, notifications | Retry route missing; video worker timeout; inline XSS; size-limit mismatch; streamed writes |
| API v1 | Resource endpoints, tokens, auth | Status/assign permission parity; token abilities; workspace selector; throttling; consistent errors |
| PATs | Create/revoke/list endpoints | Abilities/expiry not enforced; no UI page |
| Inbound email | Reply-to token, parsing, comment creation | No webhook authentication; sender identity from payload; no rate limit |
| GitHub sync | Webhook, commit link, PR state | Fail-open signature; no repo/workspace binding; no delivery ID idempotency; no throttle |
| Slack/Discord | Discord embeds/test command; generic outgoing webhooks | Native Slack integration missing; per-workspace URL/SSRF; global URL fallback |
| Exports | CSV/JSON, streaming | CSV formula injection; export authz policy |
| Workspace isolation | Switching, active workspace, policies | Global roles; NULL fail-open; `orWhereNull`; cross-tenant references |
| Invitations/roles | Invite creation/acceptance/removal | POST signature bypass; global roles; no invite/remove UI |
| Audit logging | Basic `AuditLog` writes | Missing `workspace_id`, coverage gaps, no immutability/retention |
| 2FA | TOTP setup, recovery codes, tests | Login challenge, recovery-code login, re-auth for disable/regenerate, throttling |
| OAuth | Google/GitHub login and callback | Least privilege, verified email, account linking, opt-in defaults |
| Docker | Multi-stage build, compose, entrypoint | Storage permissions, persisted `APP_KEY`, scheduler, healthcheck, secrets, non-root |
| Installer | Interactive install, migrations, seed, doctor | Secure defaults, demo-seed gating, non-interactive production mode |
| Doctor | 24 checks | Scheduler/queue/webhook/key checks; CI ordering |
| Search | Global search, filters | Indexing/performance; cross-tenant scoping |
| Accessibility | Partial labels/keys | Full keyboard/focus/ARIA coverage |
| CI | Workflow exists | Pint red; doctor before migrate; no PHPStan; no frontend tests; no DB matrix |

### C3. Broken existing features

| Broken feature | Evidence | Effect |
|---|---|---|
| Demo login | `Login.tsx:24-29,308-312` always renders personas and the password `password` | One-click Owner login where demo data exists; misleading in every deployment |
| File retry | UI calls `requests.files.retry`; no route exists (`RequestFileController:111`, `Show.tsx:122`) | Retry button always fails |
| 2FA enforcement | Login has no 2FA challenge; `/user/two-factor-authentication` requires only `auth` | "Enabled & Enforced" is false; stolen passwords bypass 2FA |
| Bulk actions | `useKanbanBoard.ts:578` marks success before awaiting | False success; rollback is ineffective |
| PAT page | `/profile/tokens` controller returns JSON; no Inertia page | Documented token UI is absent |
| Tailwind tokens | 202 uses of `zinc-650/750/850`; 0 compiled CSS rules | Intended outlines/borders are invisible |
| Docker writes | FPM `www-data`; storage `relay:relay` | Uploads, compiled views, and logs fail at runtime |
| Docker key | `entrypoint.sh:21-24` generates `APP_KEY` when missing | Sessions/encrypted data break on every restart |
| Video processing | Worker `--timeout=90`; ffmpeg 3600 | Videos are killed at 90s and retried |
| CI | Pint fails on 5 files; doctor runs before migrate | CI is red / likely fails on fresh DB |
| Cycle rollover | Command exists; `schedule:list` shows only `inspire` | Rollover never runs automatically |
| Presence | No broadcast transport; UI still shows viewer count | False real-time signal |
| Comment composer | Text cleared before request success (`RequestDiscussionSection.tsx:134`) | Lost comments on failure |
| Sidebar admin links | `Sidebar.tsx` renders Integrations/Settings without checking `auth.permissions` (`F-021`) | Non-admins receive 403s |
| Mobile | Fixed sidebar/table widths | Core workflows unusable on phones |

### C4. Important production capabilities not implemented

- Database and object-storage backup, retention, encryption, and tested restore.
- Scheduler process in Docker/systemd and a documented cron alternative.
- Monitoring, error tracking, alerting, and log rotation.
- TLS termination guidance, trusted proxies, secure cookies, HSTS, CSP, frame-ancestors, `nosniff`.
- Per-route rate limiting and abuse controls for API, webhooks, invitations, search, and uploads.
- Password reset and email verification.
- WebSocket transport (Reverb/Echo) or removal of all real-time claims.
- Frontend unit/component/E2E tests.
- Cross-database CI (PostgreSQL/SQLite) and MySQL 8.4 validation.
- Audit immutability/retention and tenant-scoped audit queries.
- Active session listing/revocation.
- Health checks for scheduler, queue, storage, encryption key, and webhook secrets.

### C5. Optional enhancements

- Swimlanes and milestone tracking (documented, so not merely optional until the README is corrected or the features are built).
- Slack integration.
- Nested/threaded comments with edit/delete.
- Rich Markdown and syntax highlighting.
- Saved filters and configurable grouping.
- Bulk edit/delete/tag/cycle beyond the current three fields.
- API OpenAPI documentation.
- Data import/migration tooling.
- Offline support.
- Active sessions UI (security-relevant; recommended).
- Richer presence/typing indicators after the transport exists.

---

## D. Security and Data Integrity

### D1. Confirmed P0 findings

#### P0-01 — Demo and default credentials are shipped and advertised

**Sources:** `F-001` (P0), `SEC-025` (P3), `QA-032` (P3). Consolidated as P0 because the login page advertises an Owner credential that works wherever the shipped demo seeder has run, and the default installer/demo paths use `password`.

**Evidence**

- `resources/js/Pages/Auth/Login.tsx:24-29` defines four demo personas including Owner; `:308-312` renders them; `:63-69` shows the password.
- `database/seeders/IndependentWorkspaceSeeder.php:94-104` creates demo users with `password` (env override allowed).
- `database/seeders/DatabaseSeeder.php:12-27` calls the demo seeder by default.
- `app/Console/Commands/RelayInstallCommand.php:219-244` defaults the admin password to `password`; `:269-286` defaults interactive sample-data seeding to yes.
- Installer test confirms admin can be created with a password and `force_password_reset=true`, but the flag is advisory only.

**Impact**

- A demo-seeded or default-installer deployment exposes a one-click Owner login.
- Even when accounts are absent, the login page advertises a default credential and undermines every credential policy.
- The default admin password remains usable until changed; `force_password_reset` only produces a post-login redirect/flash, with no route-level enforcement.

**Required fix**

- Remove demo personas and plaintext passwords from the login page.
- Require an explicit demo flag/env for demo seeding; never seed in production.
- Require a strong admin password in the installer (or generate one), and enforce password change before access if the flag is retained.
- Add a release check that fails if `password`/demo accounts exist.

**Regression tests**

- Login page renders no demo credentials.
- Installer rejects empty/weak admin passwords.
- Demo seeder refuses to run outside an explicit demo environment.
- `force_password_reset` blocks access until changed.

Effort: **S**

---

#### P0-02 — Cross-tenant team mutation and self-escalation

**Sources:** `SEC-001` (P0), `BK-01` (P1).

**Evidence**

- `app/Http/Controllers/TeamMemberController.php:108-140`: `update(User $user)` performs only a global `manage_team` check, then writes `role_id`, `name`, `email`, and optionally `password` on the bound user.
- `:142-163`: `destroy(User $user)` performs the same global check and deletes any user.
- `:178-181`: `ensureCanManage` checks only `hasPermission('manage_team')`; it never checks that the target belongs to the actor's active workspace.
- Roles are global (`users.role_id`); `User::hasPermission` (`app/Models/User.php:144-172`) reads that global role.
- `:108-140` allows self-update, so a user can change their own global role/password through the member endpoint.

**Impact**

- Any user with `manage_team` in any workspace can modify or delete any user in any tenant, including changing their password and promoting themselves.
- Combined with `SEC-003` (Developer gets all permissions), this is a direct tenant-takeover chain.

**Required fix**

- Check target membership in the actor's active workspace before any read/write.
- Move roles to a workspace pivot and authorize `manage_team` per workspace.
- Forbid self-role/password changes through the member endpoint.
- Use a dedicated password-change flow with current-password verification.
- Never allow role changes beyond the actor's own role.

**Regression tests**

- Cross-workspace update/delete returns 404/403.
- Self-promotion is rejected.
- Role/password mutation via member endpoint is rejected.
- Owner in A / Developer in B cannot manage B members.

Effort: **M** (scoping) / **L** (per-workspace roles)

---

#### P0-03 — Unauthenticated inbound email can impersonate any user

**Sources:** `SEC-002` (P0), `BK-06` (P1), `QA-011` (P2).

**Evidence**

- `app/Http/Controllers/InboundEmailWebhookController.php` has no signature, secret, or auth middleware.
- Sender identity is derived from request payload (`from`/`sender`); the controller resolves the user/workspace from it.
- The route is registered as a public webhook.
- Tests exercise the unauthenticated path as the expected behavior.

**Impact**

- Anyone who can reach the endpoint can create comments as any user, in any workspace, and trigger notifications/mentions.
- Enables social engineering, audit-log poisoning, and cross-tenant data injection.

**Required fix**

- Fail closed without a valid HMAC/shared secret (provider signature or explicit secret).
- Use a per-workspace reply token; do not trust payload sender fields.
- Rate-limit and log rejected deliveries; validate content type/size.
- Add tests for unsigned, wrong-signature, and valid-signed requests.

**Regression tests**

- Unsigned request → 401.
- Wrong secret → 401.
- Valid signature + unknown token → 404.
- Valid signed request → comment created only in the token's workspace.
- Throttle → 429.

Effort: **M**

---

#### P0-04 — OAuth auto-provisioning grants all permissions

**Sources:** `SEC-003` (P0), `BK-01` (global roles; context).

**Evidence**

- `app/Http/Controllers/Auth/SocialAuthController.php:56-77` creates a user on first OAuth login and assigns the `Developer` role.
- `database/migrations/2026_10_18_000020_sync_core_permissions.php:39-42` and `database/seeders/IndependentWorkspaceSeeder.php:42` grant `Developer` all 12 core permissions (`view_requests`, `manage_workspace`, `manage_team`, `manage_roles`, `manage_areas`, `create_requests`, `edit_requests`, `assign_requests`, `change_request_status`, `comment_requests`, `upload_request_files`, `delete_requests`).
- `.env.example` enables Google/GitHub OAuth by default.
- No invite requirement, email-domain restriction, or verified-email check gates provisioning.

**Impact**

- With provider credentials configured, any Google/GitHub account is created with the global Developer role (all 12 permissions) and no workspace membership; combined with P0-05, it can reach unscoped tenant queries.
- Combined with `P0-02`, a new OAuth user can take over the tenant.

**Required fix**

- Provision the least-privileged role (or no role) until invited/approved.
- Require a matching invite or verified company email domain.
- Do not auto-link by email; require an explicit link flow.
- Make OAuth opt-in and document provider setup.
- Grant Developer only non-administrative permissions.

**Regression tests**

- New OAuth user has no management permissions.
- OAuth signup without invite/domain is denied when configured.
- Email match does not auto-link without verification.
- Existing user link requires authenticated consent.

Effort: **M**

---

#### P0-05 — Tenant isolation fails open for workspace-less accounts and NULL rows

**Sources:** `SEC-004` (source P1; Lead re-rated P0), `BK-09` (P1), `QA-010` (P2), `BK-29` (P2).

**Evidence**

- `app/Http/Controllers/WorkRequestController.php:44`, `ExportController.php:20`, `GlobalSearchController.php:34`, and `Api/V1/WorkRequestApiController.php:32` apply workspace scoping only when an active workspace exists (`when($activeWorkspace, ...)`).
- With no active workspace, the query is unscoped and returns all workspaces' rows.
- `ExportController.php` and `GlobalSearchController.php` additionally include `orWhereNull('workspace_id')`.
- `WorkRequestPolicy` correctly scopes non-null workspace IDs but allows NULL-workspace rows.
- An account with no workspace membership or ownership (for example, a freshly OAuth-provisioned user, or one whose only membership was removed) makes `currentWorkspace()` return null; every `when($activeWorkspace, ...)` then becomes a no-op.

**Impact**

- A workspace-less account can enumerate and read requests from every tenant through list, search, export, and API.
- NULL-workspace rows are visible across tenants.
- This meets the audit's P0 criterion for cross-tenant data leakage.

**Required fix**

- Fail closed when no active workspace exists: 403 or empty set, never an unscoped query.
- Remove `orWhereNull('workspace_id')` from tenant data paths.
- Backfill `workspace_id`; make it non-nullable where required; enforce via policy.
- Scope export/search/API through a single tenant query scope.
- Add a regression test that a workspace-less user sees zero foreign rows through every surface.

**Regression tests**

- No active workspace → 403/empty for index, search, export, API.
- User in A cannot read B (including NULL rows).
- No membership/ownership cannot fall back to a global scope.

Effort: **M**

---

### D2. Confirmed P1 release-gating findings

| Theme | Source IDs | Key evidence | Required outcome |
|---|---|---|---|
| Missing authorization on relations/cycles/areas | `SEC-005`, `SEC-006`, `SEC-007`, `BK-03`, `BK-05`, `BK-10` | `RequestRelationController.php:16-186`; `CycleController.php:93-129`; `AreaController.php:45-104` | Policies + workspace membership; scoped route bindings; GET no side effects |
| Stored XSS via document serving | `SEC-008` | `RequestFileController.php:87-90` (`inline`, stored MIME); `RequestFileService.php:34-62` | `Content-Disposition: attachment`, `application/octet-stream`, `nosniff`, CSP; MIME-authoritative validation |
| GitHub webhook fail-open | `SEC-009`, `BK-08`, `QA-003` | `GitHubWebhookController.php:19-29` skips HMAC when secret empty; no repo/workspace binding; no delivery ID | Fail closed; bind repo→workspace; idempotency by delivery ID; throttle; audit |
| 2FA not enforced | `SEC-010`, `BK-07`, `F-008` | No login challenge; disable/regenerate only `auth`; recovery codes not accepted at login | Challenge after password; re-auth for changes; single-use recovery; throttle |
| Invitation POST signature bypass | `SEC-011` | Acceptance GET checks signature; POST does not; existing-user path can overwrite password | Verify signature on POST; no password overwrite; single-use token/lock; throttle |
| SSRF / global webhooks | `SEC-012`, `SEC-013` | Discord webhook editable to arbitrary URL; global URL fallback; logs | Per-workspace config; allow-list/private-IP block; redact logs |
| API authz / PAT scoping | `SEC-014`, `QA-013`, `QA-030`, `BK-23` | Status/assign lack permission checks; token abilities ignored; no workspace selector; no throttle | Permission parity; abilities/expiry; workspace selector; throttle; consistent errors |
| Cross-tenant references | `SEC-015`, `BK-04` | Area/cycle/parent/assignee IDs accepted without membership checks | Validate all references in active workspace |
| Auto-rollover never runs | `BK-02`, `QA-004` | `routes/console.php` only `inspire`; no scheduler process | Schedule command; `schedule:work`/cron; docs |
| Docker storage/APP_KEY | `QA-001`, `QA-005` | FPM `www-data`; storage `relay:relay`; key regenerated on boot | Correct ownership/permissions; require/persist key |
| Video worker timeout | `QA-002`, `QA-020` | `supervisord.conf:27` `--timeout=90`; ffmpeg 3600 | Align timeouts; media queue/retries |
| CI red / doctor ordering | `QA-006`, `QA-007` | Pint 5 files; doctor before migrate; database cache | Fix Pint; migrate before doctor; add PHPStan/frontend tests |
| No backups | `QA-014` | No backup command/schedule/restore docs | Encrypted backup + restore drill |
| No password reset | `F-007` | No routes/controller/UI | Reset flow with expiry/single-use/throttle |
| No TLS/security headers | `QA-016`, `SEC-019` | No HSTS/CSP/secure cookies/TrustProxies | Production header/HTTPS gate |
| Bulk-action false success | `F-009`, `F-017`, `F-029` | `useKanbanBoard.ts:578` marks success before await; missing `lock_version` | Await, rollback, 409 handling |
| No mobile shell | `F-006` | Fixed sidebar/table widths | Responsive navigation/layout |
| Realtime absent | `F-003`, `QA-012` | No packages/config; UI shows viewer count | Implement Reverb/Echo or remove claims |

### D3. Tenant-isolation matrix

| Surface | Isolation status | Evidence |
|---|---|---|
| Work request list | **FAIL** when no active workspace; otherwise scoped | `WorkRequestController.php:44` |
| Global search | **FAIL**; `orWhereNull` | `GlobalSearchController.php:34` |
| CSV/JSON export | **FAIL**; `orWhereNull` | `ExportController.php:20` |
| REST API v1 | **FAIL**; no workspace selector/null fallback | `Api/V1/WorkRequestApiController.php:32` |
| Dashboard counts | **FAIL** under null/workspace-less paths | `DashboardController`; `SEC-004` |
| Team members | **FAIL**; arbitrary user binding | `TeamMemberController.php:108-163` |
| Invitations | **FAIL** for POST acceptance and global role assignment | `InvitationAcceptController.php:42-90` |
| Cycles | **FAIL**; no policy/workspace check on store/rollover | `CycleController.php:93-129` |
| Areas | **FAIL**; no policy/workspace check on mutation | `AreaController.php:45-104` |
| Relations | **FAIL**; no policy/workspace checks | `RequestRelationController.php:16-186` |
| Files | Partial; request binding scopes stored files, but inline MIME enables stored XSS | `RequestFileController.php` |
| Audit log | Partial; logs lack `workspace_id` | `SEC-016` |
| GitHub webhook | **FAIL**; unsigned payload accepted | `GitHubWebhookController.php:19-29` |
| Inbound email | **FAIL**; unauthenticated | `InboundEmailWebhookController.php` |
| OAuth provisioning | **FAIL**; global Developer role | `SocialAuthController.php:56-77` |

**Conclusion:** tenant isolation is not a defense-in-depth weakness; it is absent on several primary surfaces. It must be treated as a P0 architecture issue, not a set of isolated bugs.

### D4. Permission model assessment

| Role | Intended | Actual |
|---|---|---|
| Owner | Full workspace administration | All 12 permissions globally |
| Developer | Work on requests | **All 12 permissions**, including `manage_team`, `manage_workspace`, `manage_roles`, `delete_requests` |
| Designer | Design workflow | 7 permissions; includes status changes and deletes; no management/assign |
| Member | Standard collaborator | **No `Member` role exists** in the seeder |
| Admin | Administrative | **No `Admin` role exists** in the seeder |

Roles are stored globally on `users.role_id`; a `workspace_user.role_id` pivot exists but is never consulted. There is no role hierarchy enforcement, and several endpoints have no route-level policy.

### D5. Unresolved high-risk concerns and limitations

- **No dynamic exploitation was performed.** The P0/P1 findings are static code-path confirmations, not exploit demonstrations.
- **Production environment unknown.** `.env.example` is development-oriented (`APP_DEBUG=true`, database cache/queue/session, log mail/broadcast); production values were not supplied.
- **Docker was not built or run.** Storage permissions, `APP_KEY` persistence, health checks, and scheduler behavior are static findings.
- **Redis/Reverb were not available.** The doctor reported Redis connection refused; broadcast behavior is unverified.
- **OAuth and webhook providers were not contacted.** Provider-specific signature and email-verification behavior is unverified.
- **Cross-database behavior is unverified.** Local MySQL is MariaDB; PostgreSQL/SQLite/MySQL 8.4 paths were not run.
- **No load/concurrency testing.** The 50-row/54-query probe is a microbenchmark, not a capacity test.
- **No backup restore drill.** Backup tooling does not exist.
- **No browser/E2E testing.** Frontend conclusions are static-review based.
- **Dependency risk:** `npm audit` reports 3 build-toolchain vulnerabilities (2 high, 1 moderate: `browserslist`, `source-map-js`, `baseline-browser-mapping`). `composer audit` is clean. The build packages are not shipped to the browser as runtime code, but they remain a supply-chain hygiene item.

### D6. Claims checked and not confirmed as additional findings

- The core `WorkRequestPolicy` is not globally broken; it correctly scopes non-null workspace IDs. The defect is the NULL/absent-workspace path and the endpoints that bypass it.
- File upload does enforce a size cap at the application layer; the mismatch is between nginx/PHP/application limits and the lack of a clear UX/error contract.
- The API middleware does authenticate Sanctum tokens; the defect is authorization/abilities/scoping, not missing authentication.
- The installer does support non-interactive options; the defect is insecure defaults, not total absence of non-interactive support.
- The Docker image does build a production asset bundle; the defect is runtime permissions/key/scheduler behavior, not the build stage.

---

## E. Test Results

### Commands run

| Command | Result | Notes |
|---|---|---|
| `php artisan test` | **PASS** — 195 passed, 1,055 assertions, 0 failed/skipped | ~17.3s; Lead re-ran; Agent 4 ran twice |
| `npx tsc --noEmit` | **PASS** — exit 0 | No TypeScript errors |
| `npm run lint` | **PASS** — 0 errors, 75 warnings | Warnings include unused vars, hooks deps, `any` |
| `npm run build` | **PASS** — exit 0 | Client + SSR; 3,318 client modules; `public/build` ~2.0 MB; >500 kB chunk warning |
| `./vendor/bin/pint --test` | **FAIL** — exit 1 | 5 files: `DemoWorkspaceSeeder.php`, `HandleInertiaRequests.php`, `InboundEmailWebhookController.php`, `RequestRelationController.php`, `EdgeCasesAndRaceConditionsTest.php` |
| `composer audit` | **PASS** — no advisories | Locked Composer dependencies |
| `npm audit` | **3 vulnerabilities** — 2 high, 1 moderate | `browserslist`, `source-map-js`, `baseline-browser-mapping`; build toolchain |
| `php artisan relay:doctor` | **23 pass / 1 warn / 0 fail** | Warn: Redis connection refused (expected locally) |
| `docker compose config` | **PASS** — valid | Build/up intentionally not run |
| `php artisan route:list --except-vendor` | **78 routes** | Retry route absent; profile token page absent |
| `php artisan schedule:list` | **Only `inspire` hourly** | No cycle rollover scheduled |
| 50-row board query probe | **54 queries** | Confirms N+1 path (`BK-19`) |
| `git status` | Only `reports/` untracked | `public/build` ignored; no source modified |

### Build artifact sizes

| Asset | Raw | Gzip |
|---|---:|---:|
| `AuthenticatedLayout-*.js` | 660,144 B | 183,282 B |
| `vendor-charts-*.js` | 371,840 B | 106,855 B |
| `dist-*.js` (TipTap) | 320,557 B | 99,754 B |
| `app-*.css` | 159,193 B | 21,751 B |
| Total `public/build` | ~2.0 MB | — |

The build succeeds, but the layout/charts/editor chunks exceed the 500 kB warning threshold. Route-level lazy loading exists in `app.tsx`, but the authenticated layout eagerly imports heavy UI dependencies.

### Test-quality assessment

- The 195 tests are meaningful for core server flows: request lifecycle, permissions, cycle rollover, API reads, mentions, notifications, files, exports, invitations, 2FA enrollment, installer skip-migrate, and doctor.
- They do not cover the P0 security paths as security properties: cross-tenant user mutation, workspace-less fail-open, inbound email forgery, OAuth least privilege, demo-credential absence, 2FA login challenge, webhook fail-closed behavior.
- Several tests assert insecure behavior (e.g., unsigned inbound webhook acceptance) and must be rewritten alongside fixes.
- There are no frontend unit/component/E2E tests. UI correctness, optimistic rollback, keyboard behavior, and responsive layout are untested.
- No PostgreSQL/SQLite/MySQL 8.4 matrix, no load/concurrency tests, no backup restore drill, no Docker smoke test.

### Not run / unavailable

- Browser E2E (Playwright/Cypress) — no harness configured.
- Docker build/up and container smoke tests.
- Hosted CI execution.
- Fresh-clone install and first-run wizard in a clean environment.
- PostgreSQL, SQLite, and MySQL 8.4 tests.
- Redis, Reverb, and real-time broadcast tests.
- Real Google/GitHub OAuth and GitHub/Discord webhook delivery.
- Load, soak, concurrency, and race-condition tests beyond the existing cycle tests.
- Backup and restore.
- Penetration testing / dynamic exploitation.

---

## F. Prioritized Production Blockers

**P0 — must be fixed before any production deployment**

| ID | Issue | Sources | Evidence | Required fix | Effort | Regression test |
|---|---|---|---|---|---|---|
| P0-01 | Demo/default credentials | `F-001`, `SEC-025`, `QA-032` | `Login.tsx:24-29,308-312`; seeder `:94-104`; installer `:219-244,269-286` | Remove demo UI/defaults; explicit demo flag; strong admin password; enforce reset | S | No demo creds; weak installer password rejected; demo seed gated |
| P0-02 | Cross-tenant team mutation / self-escalation | `SEC-001`, `BK-01` | `TeamMemberController.php:108-163,178-181` | Workspace membership check; per-workspace roles; forbid self-change | M/L | Cross-tenant 404/403; self-promotion rejected |
| P0-03 | Unauthenticated inbound email | `SEC-002`, `BK-06`, `QA-011` | `InboundEmailWebhookController.php` | HMAC/shared secret; reply token; throttle | M | Unsigned 401; wrong sender rejected; throttle |
| P0-04 | OAuth grants all permissions | `SEC-003` | `SocialAuthController.php:56-77`; `2026_10_18_000020_sync_core_permissions.php:39-42` | Least privilege; invite/domain gate; verified email | M | OAuth user has no management perms; no auto-link |
| P0-05 | Tenant scoping fails open | `SEC-004`, `BK-09`, `QA-010`, `BK-29` | `WorkRequestController.php:44`; `ExportController.php:20`; `GlobalSearchController.php:34`; API `:32` | Fail closed; remove `orWhereNull`; backfill; single tenant scope | M | Workspace-less user sees zero foreign rows on every surface |

**P1 — release-gating (security, data integrity, recoverability, or core product promise)**

| ID | Issue | Sources | Required fix | Effort | Regression test |
|---|---|---|---|---|---|
| P1-01 | Missing authz on relations/cycles/areas | `SEC-005`–`SEC-007`, `BK-03`, `BK-05`, `BK-10` | Policies, scoped bindings, GET no side effects | M | Cross-workspace 403; rollover requires permission |
| P1-02 | Stored XSS via inline documents | `SEC-008` | Attachment/octet-stream/nosniff/CSP; MIME-authoritative | M | HTML-as-doc downloads, not renders |
| P1-03 | GitHub webhook fail-open | `SEC-009`, `BK-08`, `QA-003` | Fail closed; repo binding; delivery ID; throttle | M | Unsigned 401; replay no duplicate; wrong repo rejected |
| P1-04 | 2FA not enforced | `SEC-010`, `BK-07`, `F-008` | Login challenge; recovery login; re-auth; throttle | M | Password-only 2FA login blocked |
| P1-05 | Invitation POST signature bypass | `SEC-011` | Verify POST; no password overwrite; single-use | S | Unsigned POST 403; existing account protected |
| P1-06 | SSRF/global webhooks | `SEC-012`, `SEC-013` | Per-workspace URL; allow-list/private-IP block; redaction | M | Private URL rejected; tenant isolation |
| P1-07 | API authz/PAT scoping | `SEC-014`, `QA-013`, `QA-030`, `BK-23` | Permission parity; abilities/expiry; workspace selector; throttle | M | Read-only token cannot write; cross-tenant API blocked |
| P1-08 | Cross-tenant references | `SEC-015`, `BK-04` | Validate area/cycle/parent/assignee membership | M | Cross-workspace refs rejected; cycle invariant |
| P1-09 | Scheduler/rollover missing | `BK-02`, `QA-004` | Schedule command; `schedule:work`; docs | S | `schedule:list` shows rollover; idempotent |
| P1-10 | Docker storage/APP_KEY | `QA-001`, `QA-005` | Correct ownership; require/persist key | M | Container upload/restart smoke; key stable |
| P1-11 | Video worker timeout | `QA-002`, `QA-020` | Align timeouts; media queue/retries | S | Slow job completes; retry works |
| P1-12 | CI red / doctor ordering | `QA-006`, `QA-007` | Pint; migrate before doctor; PHPStan; frontend tests | S/M | CI green on fresh DB |
| P1-13 | No backups/restore | `QA-014` | Encrypted DB + storage backup; retention; restore drill | M | Restore drill succeeds |
| P1-14 | No password reset | `F-007` | Reset flow with expiry/single-use/throttle | M | Reset flow; expired token rejected |
| P1-15 | No TLS/security headers | `QA-016`, `SEC-019` | HSTS/CSP/secure cookies/TrustProxies | M | Header/proxy checks |
| P1-16 | Bulk-action false success | `F-009`, `F-017`, `F-029` | Await; rollback; `lock_version`; 409 UX | M | Failure shows server truth; no false success |
| P1-17 | No mobile shell | `F-006` | Responsive nav/layout/tables | M | Mobile viewport smoke |
| P1-18 | Realtime absent | `F-003`, `QA-012` | Reverb/Echo/proxy or remove all claims | L | Presence works or UI removed |

---

## G. Implementation Roadmap

The sequence below is dependency-aware. Phase 0 removes the confirmed P0 attack paths. Phase 1 closes release-gating P1s and restores CI trust. Phase 2 adds operational maturity and performance. Phases 3–4 address product polish and optional enhancements. Estimates are relative engineering effort, not calendar commitments.

### Phase 0 — Stop the confirmed P0 attack paths

| ID | Task | Priority | Depends on | Effort | Area | Acceptance criteria | Regression tests |
|---|---|---|---|---|---|---|---|
| 0.1 | Remove demo/default credentials | P0 | — | S | Backend / Frontend / Installer | No demo personas/passwords on login; demo seed requires explicit flag; installer requires/generates strong admin password; default accounts absent; `force_password_reset` enforced | Login page has no demo creds; weak installer password rejected; demo seed refused outside demo env; reset gate blocks access |
| 0.2 | Workspace-scope team mutations and stop self-escalation | P0 | — | M | Backend / Security | update/destroy only for active-workspace members; no self role/password change; role changes cannot exceed actor | Cross-tenant 404/403; self-promotion 403; member endpoint cannot change password |
| 0.3 | Per-workspace roles, least privilege, OAuth provisioning | P0 | — | L | Backend / DB / Security | Role resolved from workspace pivot; Developer lacks `manage_*`; OAuth users get no management role; no auto-link by unverified email; OAuth opt-in | Owner in A/Developer in B; OAuth user cannot manage; verified-email link only |
| 0.4 | Fail-closed tenant scoping and NULL backfill | P0 | 0.3 (recommended) | M | Backend / DB | No workspace → 403/empty; `orWhereNull` removed; NULL rows backfilled; export/search/API use one tenant scope | Workspace-less user sees zero foreign rows on index/search/export/API; NULL row invisible cross-tenant |
| 0.5 | Authenticate inbound email | P0 | — | M | Backend / Integrations | HMAC/shared secret fail-closed; per-workspace reply token; throttle; audit rejects | Unsigned 401; wrong signature 401; valid signed accepted; throttle 429 |

**Phase 0 exit gate:** all Phase 0 regression tests pass; a security-focused re-review confirms no unscoped tenant query, no default credential path, and no unauthenticated mutation endpoint.

### Phase 1 — Close release-gating security and reliability gaps

| ID | Task | Priority | Depends on | Effort | Area | Acceptance criteria | Regression tests |
|---|---|---|---|---|---|---|---|
| 1.1 | Authorization for relations, cycles, areas | P1 | 0.3, 0.4 | M | Backend | Policies/permissions + workspace membership; scoped bindings; unique cycle numbers/transaction; no GET side effects | Cross-workspace 403; rollover permission; cycle-number race |
| 1.2 | File serving, retry, upload limits | P1 | — | M | Backend / Frontend | Attachment + octet-stream + nosniff/CSP; MIME-authoritative; retry route; nginx/PHP/app limits aligned; streamed writes | HTML-as-doc downloads; retry 200; boundary uploads |
| 1.3 | GitHub webhook hardening | P1 | 0.3 | M | Backend / Integrations | Fail closed; repo→workspace binding; delivery ID idempotency; throttle; audit | Unsigned 401; replay no duplicate; cross-workspace PR blocked |
| 1.4 | Enforce 2FA | P1 | — | M | Backend / Frontend | Login challenge; recovery codes; re-auth for disable/regenerate; throttle | Password-only 2FA login blocked; recovery single-use |
| 1.5 | Invitation POST signature and account protection | P1 | — | S | Backend | Signature on POST; no password overwrite; single-use/lock; throttle | Unsigned/tampered POST 403; existing account protected |
| 1.6 | Integration SSRF and tenant scoping | P1 | 0.3, 0.4 | M | Backend / Security | Per-workspace webhook config; URL allow-list/private-IP block; redacted logs | Private URL rejected; tenant A URL receives only A events |
| 1.7 | API parity and token scoping | P1 | 0.3, 0.4 | M | Backend / API | Status/assign permissions; Sanctum abilities/expiry/revocation; workspace selector; throttle; error shapes | Read-only token cannot write; cross-tenant 403; 429 |
| 1.8 | Cross-tenant references and dependency invariants | P1 | 0.4 | M | Backend | Area/cycle/parent/assignee validated; self/descendant parent rejected; transitive cycle detection; subtask toggle side effects | Cross-workspace refs 422/403; transitive cycle rejected; toggle unblocks |
| 1.9 | Scheduler and cycle rollover | P1 | — | S | Backend / Ops | `relay:cycle-rollover` scheduled with `withoutOverlapping`; `schedule:work` in Docker/cron; docs | `schedule:list`; idempotent rollover |
| 1.10 | Docker/ops baseline | P1 | 1.9 | M | Ops | FPM can write storage; APP_KEY required/persisted; healthcheck `/up`; non-root; no weak defaults/public services | Container upload/restart key stability; healthcheck; compose config |
| 1.11 | Video/queue reliability | P1 | 1.10 | S | Backend / Ops | Job/worker/retry_after aligned; media queue; failed handler | Slow synthetic job completes; retry |
| 1.12 | Password reset and email verification | P1 | mail config | M | Backend / Frontend | Reset flow, expiry/single-use/throttle; verification for email/OAuth | Reset flow; expired token; unverified change blocked |
| 1.13 | Frontend correctness: bulk, lock_version, retry, cycle UI | P1 | 1.2, 0.4 | M | Frontend | Await bulk requests; rollback; lock_version everywhere; retry; create/assign cycle; no false success | Vitest/RTL hooks; Playwright board/bulk/cycle |
| 1.14 | CI green and gates | P1 | — | S | QA / CI | Pint pass; migrate before doctor; PHPStan; frontend tests; composer/npm audit; PostgreSQL/SQLite matrix | CI green on fresh DB |
| 1.15 | Backup/restore | P1 | 1.10 | M | Ops | Encrypted DB+storage backup; retention; documented restore drill | Restore drill in staging |
| 1.16 | Realtime: implement or descope | P1 | 1.10 | L | Backend / Frontend / Ops | Reverb/Echo/proxy works, or all presence/realtime claims and UI removed | Presence E2E or claims removed |
| 1.17 | Responsive/mobile shell | P1 | 1.13 | M | Frontend | Responsive navigation, drawer/sidebar, tables usable at phone widths | Mobile viewport/E2E smoke |
| 1.18 | TLS/proxy/security headers | P1 | 1.10 | M | Ops / Backend | HSTS/CSP/frame-ancestors/secure cookies/TrustProxies documented and configured | Header/proxy checks |

**Phase 1 exit gate:** all P0/P1 fixes merged; CI green; security re-test passes; Docker smoke test passes; restore drill recorded.

### Phase 2 — Operational maturity and performance

| ID | Task | Priority | Depends on | Effort | Area | Acceptance criteria | Regression tests |
|---|---|---|---|---|---|---|---|
| 2.1 | Realtime follow-up (only if implemented) | P2 | 1.16 | M | Backend / Frontend / Ops | Presence/typing hardening, reconnect/backoff, broadcast auth | Presence/reconnect E2E |
| 2.2 | Performance: queries, pagination, search index, bundle | P2 | — | M | Backend / Frontend | `withCount`; board pagination/virtualization; FULLTEXT/Scout; split layout/charts/editor chunks; memoize | Query count/latency budget; bundle budget |
| 2.3 | Monitoring, alerting, log rotation | P2 | 1.10 | M | Ops | Error tracking; queue/worker/disk/DB alerts; rotation | Alert drill |
| 2.4 | Rate limiting and header hardening follow-up | P2 | 1.18 | M | Ops / Backend | Per-route throttles; CSP/report-only tuning; proxy edge cases | Rate-limit/header checks |
| 2.5 | Audit completeness/immutability/retention; CSV escaping | P2 | 0.4 | M | Backend | `workspace_id`; coverage; append-only; retention; CSV formula escaping | Tenant-scoped audit; tamper attempt fails; CSV safe |
| 2.6 | Accessibility | P2 | 1.13 | M | Frontend | Labels, focus traps/restore, keyboard lists, ARIA, contrast | Axe + keyboard E2E |
| 2.7 | Frontend test suite | P2 | 1.13 | M | QA / Frontend | Vitest/RTL + Playwright for critical flows | Suite runs in CI |
| 2.8 | Runtime/CI matrix and fresh-clone install | P2 | 1.10, 1.14 | M | QA / Ops | Docker build/up smoke; fresh clone; PostgreSQL/SQLite; MySQL 8.4 | Matrix green |
| 2.9 | Installer/doctor hardening | P2 | 0.1 | S | Backend / Ops | Secure defaults; production non-interactive mode; doctor checks scheduler/queue/key/webhooks | Installer/doctor tests |
| 2.10 | Search/filter UX and saved filters | P2 | 2.2 | M | Frontend / Backend | Persisted filters; configurable grouping; bulk operations | UI tests |
| 2.11 | Active sessions and session revocation | P2 | — | M | Backend / Frontend | List/revoke sessions; current-session marker; audit | Session revocation test |
| 2.12 | Date/timezone consistency | P2 | — | S | Backend / Frontend | UTC storage; workspace timezone; consistent date-only handling | DST/timezone tests |

### Phase 3 — Product polish and documented gaps

| ID | Task | Priority | Depends on | Effort | Area | Acceptance criteria | Regression tests |
|---|---|---|---|---|---|---|---|
| 3.1 | Design tokens/dead classes/lint warnings | P3 | — | S | Frontend | 202 undefined zinc classes resolved; lint warnings reduced; dead components removed | Visual smoke; lint |
| 3.2 | Command palette/shortcut correctness | P3 | 2.6 | S | Frontend | Esc closes palette; shortcuts work; cheat sheet; persona list removed | Keyboard E2E |
| 3.3 | Unsaved changes/error recovery | P3 | 1.13 | S | Frontend | Dirty-state guard; coherent error surfaces | Navigation-with-dirty test |
| 3.4 | Swimlanes and milestones | P3 | 2.2 | M | Full stack | Implement documented features or remove README claims | Board/roadmap tests |
| 3.5 | Markdown/syntax highlighting | P3 | — | S | Frontend / Backend | Sanitized Markdown; highlighted code; persisted source | XSS/sanitization tests |
| 3.6 | Nested comments/edit-delete | P3 | — | M | Full stack | Threaded comments; edit/delete with authz/audit | Comment authz tests |
| 3.7 | API docs/OpenAPI | P3 | 1.7 | S | Backend | Published contract; examples; auth/error docs | Schema lint |
| 3.8 | Data import/migration | P3 | 1.7 | M | Backend | Import jobs with validation/rollback | Import fixture tests |

### Phase 4 — Optional enhancements

| ID | Task | Priority | Depends on | Effort | Area | Acceptance criteria | Regression tests |
|---|---|---|---|---|---|---|---|
| 4.1 | Slack integration | P3 | 1.6 | M | Backend / Integrations | Signed/per-workspace Slack webhook; retries | Slack mock tests |
| 4.2 | Offline support | P3 | 2.1 | M | Frontend | Read-only cache/offline queue with conflict handling | Offline E2E |
| 4.3 | Rich presence/typing | P3 | 2.1 | S | Frontend / Backend | Presence accurate; no false counts | Presence E2E |
| 4.4 | Active sessions UX refinements | P3 | 2.11 | S | Frontend | Device/location metadata; revoke-all | UI tests |
| 4.5 | Advanced analytics | P3 | 2.2 | M | Full stack | Configurable metrics; export | Analytics tests |

---

## H. Release Decision

### Decision: **NO-GO**

Relay Studio must not be deployed to production in its current state.

**Reasons**

1. **Confirmed P0 security defects exist in shipped code paths.** Default/demo credentials, cross-tenant team mutation, unauthenticated inbound email, OAuth privilege escalation, and fail-open tenant scoping are not hypothetical hardening items; they are direct paths to tenant compromise or cross-tenant data exposure.
2. **Multiple P1 security controls are absent or fail open.** Authorization is missing on relations/cycles/areas; document serving enables stored XSS; GitHub webhooks accept unsigned payloads; 2FA is not challenged; invitation POSTs skip signature verification; webhook URLs are global/SSRF-prone; API token abilities are ignored.
3. **Tenant isolation is architecturally incomplete.** Roles are global, not per workspace. Several queries use `when($activeWorkspace, ...)` or `orWhereNull`, which fail open. This is not a localized bug; it requires a consistent tenant-scoping boundary.
4. **Production operations are not ready.** The scheduler is not running, Docker cannot write storage as configured, `APP_KEY` is ephemeral, there are no backups, and there is no monitoring/alerting/log rotation.
5. **Delivery quality gates are not trustworthy.** CI is red (Pint, doctor ordering), there is no PHPStan gate, and there are no frontend/E2E tests.
6. **Security-critical behavior is unverified at runtime.** Docker, Redis/Reverb, OAuth providers, webhooks, cross-database behavior, load/concurrency, and backup restore were not exercised. The audit cannot certify them.

### Why not CONDITIONAL GO

A conditional go is appropriate when remaining risks are operational, bounded, and covered by explicit launch controls. Here, the unresolved items include confirmed P0 vulnerabilities and a broken tenant boundary. Shipping with compensating controls would still expose cross-tenant data and admin takeover paths. The only defensible posture is NO-GO until Phase 0 and the security-critical Phase 1 gates are complete and re-tested.

### Conditions for re-audit

A re-audit should be scheduled only after:

- All Phase 0 tasks are merged with regression tests.
- All Phase 1 tasks (1.1–1.18) are merged and CI is green.
- Docker build/up, fresh-clone install, and backup restore are executed successfully in a staging environment.
- A focused security review confirms: no unscoped tenant query, no unauthenticated mutation endpoint, no default credential path, 2FA challenge enforced, webhook signatures fail closed, file downloads are non-rendering, and API/PAT permissions match the UI.
- The full backend suite, frontend tests, TypeScript, lint, Pint, PHPStan, and dependency audits pass.

### What would justify GO later

- Zero confirmed P0/P1 security findings in the re-audit.
- Tenant isolation tests pass on every data surface, including NULL/absent workspace paths.
- Docker and installer succeed from a clean environment with persisted secrets and a working scheduler.
- Backups and restore are demonstrated.
- CI is green and covers backend, frontend, and at least one non-MySQL database.
- Monitoring/alerting and security headers are in place.
- The product's documented features either work or the claims are removed.

---

## Appendix A — Source report index

| Report | Finding range | Raw severity counts | Notes |
|---|---|---|---|
| `01-backend-audit.md` | `BK-01`–`BK-31` | 9 P1 · 12 P2 · 10 P3 | Backend feature matrix; internal summary table has a 1-off count error |
| `02-frontend-product-audit.md` | `F-001`–`F-044` | 1 P0 · 11 P1 · 24 P2 · 8 P3 | Product/page/component audit; no browser E2E |
| `03-security-audit.md` | `SEC-001`–`SEC-025` | 3 P0 · 12 P1 · 7 P2 · 3 P3 | Permission matrix and tenant-isolation assessment |
| `04-qa-deployment-audit.md` | `QA-001`–`QA-035` | 7 P1 · 15 P2 · 13 P3 | Commands, Docker, ops, test quality |

## Appendix B — Audit limitations

- No production credentials, infrastructure, or customer data were used.
- No dynamic exploitation, penetration testing, load testing, or chaos testing was performed.
- No browser, Docker runtime, Redis/Reverb, OAuth provider, webhook provider, backup restore, or cross-database test was executed.
- The frontend conclusions are static-review based; visual/accessibility/responsive behavior was not rendered.
- Severity is a pre-production judgment based on code paths and test evidence; exploitability may vary with deployment configuration.
- The local environment uses MariaDB; MySQL 8.4/PostgreSQL/SQLite behavior may differ.
- This audit did not write to the pre-existing `00-PRODUCTION-READINESS.md`; it remains a separate consolidation. That file was independently updated during the audit window and references an earlier `B-###` finding set. It should not be used for release decisions without reconciliation.
- This report does not implement fixes. It intentionally leaves the application source untouched.
