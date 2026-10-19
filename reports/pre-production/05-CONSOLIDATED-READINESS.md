# 🛑 Relay Studio — Pre-Production Audit & Release Readiness Assessment

**Document:** `reports/pre-production/00-PRODUCTION-READINESS.md`
**Target:** Relay Studio — `/Volumes/Main/Herd/stm`
**Commit audited:** `94ce903` — *"style: replace neon avatar gradients with dark obsidian tinted palettes"* (clean tree)
**Assessment date:** 2026-10-19
**Role:** Lead Engineering Auditor (consolidating four specialist audits)

**Source reports (135 findings total):**

| ID | Scope | Report | Findings | P0 | P1 | P2 | P3 |
|---|---|---|---|---|---|---|---|
| `B-` | Backend architecture & feature completeness | `01-backend-audit.md` | 56 | 5 | 14 | 24 | 13 |
| `F-` | Frontend, UX & product completeness | `02-frontend-product-audit.md` | 44 | 1 | 11 | 24 | 8 |
| `SEC-` | Security, multi-tenancy & integrations | `03-security-audit.md` | 20 | 3 | 9 | 3 | 1* |
| `OPS-` | QA, performance, deployment & reliability | `04-qa-deployment-audit.md` | 15 | 0 | 6 | 7 | 2 |
| **Total** | | | **135** | **9** | **40** | **58** | **24** |

\* Some SEC/OPS findings carry severity in summary tables rather than a per-finding `Severity:` line; counts reflect explicit per-finding severity tags.

> **Provenance note.** A file at this path existed before this consolidation was authored. It was **not** commissioned by this audit run. It has been replaced by a report consolidated directly from the four source reports, with the highest-severity claims independently re-verified against source code (evidence in §E.2). One apparent discrepancy in the prior version (citing finding IDs absent from the source reports) was investigated and resolved: the source reports use `#### [SEC-NN]` and `### [OPS-NN]` heading forms, so those IDs were valid. No source discrepancy remained.

---

## Release Decision

```text
╔══════════════════════════════════════════════════════════════════════════╗
║                    FINAL RELEASE DECISION:  NO-GO                       ║
╠══════════════════════════════════════════════════════════════════════════╣
║  9 confirmed P0 (Critical)  ·  40 confirmed/assessed P1 (High)           ║
║  Full account takeover, cross-tenant data leakage, unauthenticated       ║
║  write paths, and unenforced 2FA are all reachable today.                ║
║                                                                          ║
║  Do NOT deploy to staging shared with real data, and do NOT deploy       ║
║  to production under any configuration.                                  ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## A. Executive Summary

### Overall production readiness: **NOT READY**

Relay Studio is a genuinely well-built application that is nonetheless **categorically unsafe to deploy today**. The engineering craft is real and unusual: a consistent `Controller → FormRequest → Policy → Service → Model` chain, 12 granular permissions, real optimistic locking via `lock_version`, transactions on main write paths, and a 195-test suite that passes clean. But that craft sits on top of a set of **fail-open** authorization decisions and **missing verification steps** that convert ordinary bugs into account compromise and cross-tenant disclosure.

The decisive point is not that many things are broken. It is that **the system's own security boundaries are advisory**. Three independent structural defects compound:

1. **Any account can be taken over, and the attacker is logged in as the victim.** `InvitationAcceptController::store()` does not verify the signed-URL signature that `show()` enforces, overwrites an existing user's password, force-activates deactivated accounts, and then calls `Auth::login($user)`. (SEC-01 / B-004)
2. **Tenant isolation fails open by design.** `requests.workspace_id` is nullable, and policies short-circuit on `workspace_id !== null`. Five read paths deliberately union `orWhereNull('workspace_id')`, so rows belonging to no workspace are returned to *every* tenant via API, global search, and exports. (B-010 / B-014)
3. **Two of the three "verified" trust boundaries are opt-in, not opt-out.** The GitHub webhook only verifies a signature `if (! empty($secret))`, and `.env.example` never defines `GITHUB_WEBHOOK_SECRET`; the inbound-email webhook is entirely unauthenticated. Both then resolve `REQ-<id>` with an **unscoped global** `find()`. (SEC-06 / B-001 / B-002 / B-003)

Layered on top: 2FA is configured but **never challenged at login** (SEC-04), the production login page **ships one-click credentials for a seeded Owner account** (F-001), cycle rollover is **never scheduled** (B-007), real-time is **structurally non-functional** yet renders a confident "1 viewing now" (F-003), and 202 Tailwind class usages emit **no CSS at all** (F-004).

### Most important strengths (preserve these)

- **Clean architecture spine.** Service-layer encapsulation is consistent; business logic is not smeared through controllers.
- **Genuine optimistic locking.** `lock_version` + HTTP 409 + a frontend conflict banner is a correct pattern, well beyond most self-hosted trackers. It is undermined only by inconsistent client coverage (F-029).
- **Excellent test discipline for an open-source app.** 195 tests / 1,055 assertions, all passing, covering cycles, tenancy, permissions, locking, and transactions.
- **Zero TypeScript errors** and a working SSR build — the frontend is type-safe and type-clean.
- **Dependency hygiene is good on the PHP side**: `composer audit` reports no advisories.

### Critical weaknesses

| # | Weakness | Evidence |
|---|---|---|
| 1 | Full account takeover via invitation acceptance | SEC-01 / B-004 — re-verified |
| 2 | Fail-open tenant isolation via nullable `workspace_id` | B-010 / B-014 |
| 3 | Unauthenticated, unscoped webhook writes | B-001, B-002, B-003 / SEC-06, SEC-03 |
| 4 | 2FA entirely unenforced | SEC-04 / B-006 — re-verified |
| 5 | Production login page ships Owner credentials | F-001 — re-verified |
| 6 | Cross-tenant IDOR on users, areas, cycles | SEC-02, SEC-07, SEC-08 |
| 7 | SSRF with response reflection | SEC-05 |
| 8 | Ephemeral `APP_KEY` in Docker entrypoint | OPS-04 — re-verified |
| 9 | No scheduler; cycle rollover never runs | B-007 / OPS-05 — re-verified |
| 10 | Real-time stack is entirely absent | B-017 / F-003 / OPS-03 |

### Confidence in this audit: **Moderate-high for static findings, moderate for runtime**

- 9 P0 and the large majority of P1 findings are **CONFIRMED** via direct source reading with quoted code, and the ten most severe were **independently re-verified by the Lead Auditor** (§E.2).
- The full 195-test suite was **executed and independently reproduced**.
- Residual uncertainty is concentrated in: PostgreSQL behaviour (no PG server available), Redis-backed paths, media/ffmpeg processing, live OAuth, and all browser-runtime UI behaviour (no browser was launched).

### Checks that could NOT be performed

- PostgreSQL runtime behaviour — no PG server available (B-023 is analytical, not executed).
- Any browser-level / real-time UI behaviour — no browser or Reverb server was launched; all realtime findings are static.
- Live OAuth against Google/GitHub — no provider credentials.
- Media pipeline (ffmpeg/ffprobe) processing — no media fixtures.
- S3/cloud storage download path — no S3-compatible endpoint (OPS-02 is code-reasoned).
- Redis-backed cache/queue/rate-limiter behaviour under failover.
- Docker image build — not executed by the Lead Auditor; Dockerfile findings are from static reading.
- Load, stress and concurrency testing — **no benchmark numbers are reported anywhere in this audit**; performance findings are explicitly labelled ANALYTICAL.

---

## B. Complete Feature Inventory

Status key: **V**=VERIFIED (implemented *and* validated) · **U**=IMPLEMENTED/UNVERIFIED · **P**=PARTIAL · **M**=MISSING · **B**=BROKEN · **N**=NOT ASSESSED

| # | Feature | Status | Backend | Frontend | Tested | Missing Work | Priority |
|---|---|---|---|---|---|---|---|
| 1 | Issue CRUD + identifiers | **B** | CRUD real | UI present | Yes | Force-delete instead of soft-delete (B-009); no state machine (B-020); API create/update lacks policies (B-019) | P1 |
| 2 | Kanban board | **V** | n/a | DnD works | Yes | N+1 `files_count` query per card (B-011) | P2 |
| 3 | List view | **V** | n/a | Works | Yes | Same N+1 (B-011) | P2 |
| 4 | Optimistic updates | **P** | 409 exists | Rollback works | Yes | Bulk action errors swallowed (F-009); inconsistent 409 coverage (F-029) | P1 |
| 5 | Story points | **V** | Yes | Yes | Yes | Velocity metric is not story points (B-021) | P2 |
| 6 | Subtasks / hierarchy | **P** | Works | No parent UI | Yes | `parent_id` self-reference allowed (B-015); toggle bypasses service (B-029); no nested-issue UI (F-036) | P1 |
| 7 | Issue dependencies | **P** | Direct only | UI works | Yes | Transitive cycles accepted (B-008); controller has zero authorization (B-012) | **P0** |
| 8 | Automatic unblocking | **P** | Works | n/a | Yes | Bypassed by subtask toggle path (B-029) | P2 |
| 9 | Tags / priorities / due dates | **P** | Yes | Yes | Yes | `'high'` is not a valid enum value (B-047) | P2 |
| 10 | Cycle management | **P** | Create/store exists | **No create UI** | Yes | `cycles.store` never called; no update/rename/delete (F-032) | P1 |
| 11 | Automatic cycle rollover | **B** | Command exists, idempotent | — | Yes | **Never scheduled** — not in `routes/console.php`, not in supervisord (B-007/OPS-05) | **P0** |
| 12 | Velocity + burndown | **P** | Computed | Charts render | Yes | Velocity = 7-day ticket count (B-021); burndown never persisted (B-022) | P2 |
| 13 | Roadmap + Gantt | **P** | Yes | Renders | Yes | Progress is lifetime, not quarter-scoped (B-053) | P2 |
| 14 | Command palette | **P** | `/api/search` | `cmdk` wired | Yes | No Esc/focus trap (F-026); pagination offset div-by-0 (F-007) | P2 |
| 15 | Keyboard-first navigation | **P** | n/a | `j/k/Enter` work | Yes | 3 of 14 documented keys wrong (F-014/F-015) | P3 |
| 16 | Optimistic locking / conflict | **P** | `lock_version` | Banner exists | Yes | Client-dependent enforcement (B-040); inconsistent UI coverage (F-029) | P1 |
| 17 | Server-side undo | **M** | No code exists | Toast only | No | **Entirely absent** — frontend implies it | P2 |
| 18 | Markdown + syntax highlight | **P** | Sanitizer | Partial | Yes | XSS via unescaped concatenation (SEC-10); limited Markdown subset (F-019) | **P0** |
| 19 | Live presence | **B** | Events exist | **No Echo client** | No | `window.Echo` never assigned; no `laravel-echo`/`reverb` dep; no `config/broadcasting.php` (F-003/B-017/OPS-03) | **P0** |
| 20 | @mentions + notifications | **P** | Yes | Wired | Yes | No listbox a11y (F-025); comment lost on failure (F-018) | P2 |
| 21 | File upload / conversion / preview | **B** | Yes | Dropzone works | Yes | Retry route doesn't exist (F-002/B-044); S3 driver crashes (OPS-02) | P1 |
| 22 | REST API v1 | **P** | Routes exist | n/a | Yes | No rate limiting (B-025); no workspace selection (B-039); cross-workspace IDs accepted (B-026); error shapes inconsistent (B-056); `search` param undocumented/not implemented (B-024) | P1 |
| 23 | Personal access tokens | **P** | Sanctum | `/profile/tokens` broken | Yes | No expiry; abilities unenforced (SEC-17); UI route broken (F-011) | P1 |
| 24 | Inbound email replies | **B** | Controller exists | n/a | Yes | **Completely unauthenticated** (B-002); impersonation + comment injection (SEC-03) | **P0** |
| 25 | GitHub commit/PR sync | **B** | Controller exists | No UI | Yes | Signature optional when secret unset; unscoped `find()`; no replay protection (B-001/B-003/SEC-06) | **P0** |
| 26 | Slack/Discord notifications | **P** | Discord only | Dashboard | Yes | **Full SSRF + response reflection** (SEC-05); no Slack at all (F-031) | **P0** |
| 27 | CSV/JSON exports | **P** | Works | n/a | Yes | CSV formula injection (SEC-15/B-042); leaks orphan rows (B-014) | P1 |
| 28 | Workspace isolation + switching | **B** | Fails open | Switcher works | Yes | **Nullable FK + `orWhereNull` unions** (B-010/B-014); null workspace aggregates all tenants (OPS-01) | **P0** |
| 29 | Invitations + roles | **B** | **Takeover** | Member mgmt partial | Yes | SEC-01; role/permission service is dead code (B-038); member routes unused (F-022) | **P0** |
| 30 | Audit logging | **B** | `AuditService` exists | Renders empty | Yes | **Never writes `workspace_id`** → audit log permanently empty (B-018) | P1 |
| 31 | Two-factor authentication | **B** | Setup works | Says "Enforced" | Yes | **Never enforced at login**; disable without re-auth (SEC-04/B-006/B-041) | **P0** |
| 32 | Google/GitHub OAuth | **P** | Socialite wired | Buttons work | No | Auto-registration grants Developer role (SEC-12); no live verification | P1 |
| 33 | Docker deployment | **B** | Builds | n/a | No | Ephemeral `APP_KEY` (OPS-04); no scheduler (OPS-05); floating `mailpit:latest`; no app healthcheck | **P0** |
| 34 | Interactive installer | **P** | Exists | n/a | Yes | Mutates `.env` via regex (OPS-14); non-idempotent | P2 |
| 35 | Health diagnostics (`relay:doctor`) | **P** | Exists | n/a | Yes | Misses the actual production blockers; README sample output stale (B-052) | P2 |
| 36 | Swimlanes / triage inbox | **P** / **V** | n/a | Triage ✅, swimlanes ❌ | Yes | Swimlanes zero occurrences repo-wide (F-037) | P3 |
| 37 | Responsive / mobile layout | **M** | n/a | No breakpoints | No | Sidebar non-responsive (F-006) | P3 |
| 38 | Password reset | **M** | **No route or controller** | No "Forgot password?" link | No | **Absent** (F-010) | P1 |

---

## C. Missing & Broken Functionality

### C.1 Documented features entirely MISSING
1. **Server-side undo** — no backend code exists; the frontend toasts an undo affordance that has nothing behind it.
2. **Swimlanes** — claimed in README's feature table; zero occurrences repo-wide (F-037).
3. **Milestone tracking** — claimed in README; zero occurrences (F-037).
4. **Password reset / forgot password** — no route, no controller, no UI (F-010).
5. **Assign a ticket to a sprint** — `cycle_id` is fully supported by the backend and API resource, but **no frontend control sets it** (F-005).
6. **Nested issue (parent) UI** — backend accepts `parent_id`; no UI (F-036).
7. **Slack integration** — README claims Slack/Discord; only Discord exists (F-031).
8. **Saved-filter UI** (F-044), **responsive layout** (F-006).

### C.2 Documented features PARTIALLY implemented
- **Cycle management** — list/view/rollover only; `cycles.store` exists server-side but no UI calls it; no rename/update/delete (F-032).
- **Dependencies** — direct-cycle detection only; transitive cycles accepted; controller performs no authorization (B-008, B-012).
- **Velocity/burndown** — computed on every request, never persisted; velocity is not sprint velocity (B-021, B-022).
- **Saved views** — create + list only; no delete/unpin (F-022).
- **Markdown** — supports bold/code/headings/lists/fences only; no tables/links (F-019).
- **API v1** — missing rate limiting, workspace selection, consistent errors; documented `search` param not implemented (B-024, B-025, B-039, B-056).
- **OAuth** — wired but auto-registration grants a role (SEC-12).
- **Docker** — builds, but entrypoint, scheduler and healthcheck are all deficient (OPS-04, OPS-05, OPS-13).

### C.3 Existing features that are BROKEN
| Finding | Broken behaviour |
|---|---|
| SEC-01 / B-004 | Invitation acceptance takes over any existing account |
| B-001 / B-003 | GitHub webhook mutates any work request, unscoped |
| B-002 / SEC-03 | Inbound-email webhook fully unauthenticated |
| B-006 / SEC-04 | 2FA never enforced at login |
| B-007 / OPS-05 | Cycle rollover never scheduled |
| B-017 / F-003 / OPS-03 | Real-time / presence entirely non-functional |
| F-001 | Login page ships Owner credentials |
| F-002 / B-044 | Retry button calls a route that does not exist |
| F-004 | 202 Tailwind classes emit no CSS |
| F-009 | Bulk actions always report success |
| B-009 | Web delete is a hard delete |
| B-018 | Audit log permanently empty |
| OPS-02 | S3 storage driver crashes on download |

### C.4 Important production capabilities not implemented
- **No automated database backup** and no restore runbook (OPS-11).
- **No scheduler daemon** — cycle rollover and any periodic work never execute (OPS-05).
- **No security headers** middleware — no CSP, HSTS, X-Frame-Options, X-Content-Type-Options (SEC-18).
- **No `config/cors.php`** — CORS effectively fully open (B-055).
- **No error-tracking or alerting** integration; logging to a monolithic file rather than Docker stdout (OPS-10).
- **No static analysis in CI** — `phpstan.neon` exists but Larastan is not installed (OPS-07).
- **No browser/E2E test suite** in `phpunit.xml` or `package.json`.
- **No rate limiting on API v1 or global search** (B-025).
- **No token expiry** on personal access tokens (SEC-17).
- **No disk-exhaustion handling** for attachments/logs.

### C.5 Optional enhancements (explicitly NOT blockers)
Issue linking ("relates to" beyond current `duplicate`), bulk edit, per-user notification granularity, global saved filters, issue templates, custom fields, advanced search syntax, dark/light theme toggle, CSV import, keyboard shortcut cheat-sheet polish, mobile-first navigation.

---

## D. Security & Data Integrity Summary

### D.1 Confirmed P0 security findings

| ID | Finding | Severity | Verification |
|---|---|---|---|
| **SEC-01** | **Account takeover via invitation acceptance** — `store()` skips the signature check `show()` enforces; overwrites `password`, force-sets `active=true` (un-suspending disabled admins), clears `force_password_reset`, then `Auth::login($user)` as the victim. No `DB::transaction`. | **P0** | **Lead-auditor re-verified**, `InvitationAcceptController.php:42-89` |
| **B-010** | **Tenant isolation fails open** — `requests.workspace_id` is `nullable()`; policies short-circuit `if ($workspace_id !== null && ...)`, so unassigned rows bypass all workspace checks. | **P0** | Re-verified (migration `:36,40,44`) |
| **B-001/SEC-06** | **Unauthenticated webhook write** — signature checked only `if (! empty($secret))`; `.env.example` defines no `GITHUB_WEBHOOK_SECRET`; handler then does an unscoped `WorkRequest::find()`. | **P0** | **Lead-auditor re-verified**, `GitHubWebhookController.php:18-27,60` |
| **B-002/SEC-03** | **Unauthenticated inbound-email webhook** — creates issues and injects comments, with sender verification bypass and impersonation. | **P0** | Agent-verified |
| **SEC-02** | **Cross-tenant user modification + global account deletion** (IDOR) — deleting a team member purges the user globally (B-013). | **P0** | Agent-verified |
| **F-001** | **Login page ships working Owner credentials** — `robin`/`hussien`/`brother`/`designer-1` with `password: 'password'`, rendered unconditionally. | **P0** | **Lead-auditor re-verified** |
| **B-006/SEC-04** | **2FA never enforced** — no 2FA middleware exists; login never issues a TOTP challenge, yet the UI reads "Enabled & Enforced". | **P0** | **Lead-auditor re-verified** |
| **OPS-04** | **Ephemeral `APP_KEY`** — entrypoint generates a new key per container start when unset → session/cookie/encryption invalidation and token loss on every restart. | **P0** | **Lead-auditor re-verified** |
| **SEC-05** | **Full SSRF with response-body reflection** via Discord "ping" — arbitrary URL accepted as `url`, response body returned to caller. | **P0** | Agent-verified (code quoted) |

### D.2 Workspace isolation verdict: **FAILS**

Isolation is **not** sound. It holds on the well-worn web paths but fails in at least six distinct places: nullable-FK policy short-circuiting (B-010), five `orWhereNull` read unions (B-014), global user deletion (B-013/SEC-02), unscoped webhook lookups (B-003), cycle routes with no scoping (B-030/B-031/SEC-08), outgoing webhooks fanning out to every workspace (B-028/SEC-09), background jobs (B-027), and a null-workspace dashboard that aggregates across all tenants (OPS-01). The recurring root cause is the same everywhere: **`orWhereNull('workspace_id')` and nullable FKs treated as harmless, when they are precisely the rows every tenant can see.**

Note the inconsistency: `RoadmapController:64` and `CycleController:28` scope strictly with no `orWhereNull`, so orphan data appears in some views and not others — a correctness bug as well as a security one.

### D.3 Permission enforcement: **FAILS**

Policies exist and are numerous, but they are inconsistently invoked. `RequestRelationController` performs **zero** authorization (B-012); cycle routes are unauthorised and unscoped (B-030); API `update` skips `changeStatus` and `assign` policies (B-019); API writes accept cross-workspace `assignee_id`/`area_id`/`cycle_id`/`parent_id` (B-026); OAuth auto-registration grants a role (SEC-12); role/permission management service is fully written but **orphaned with zero callers** (B-038). A permission system that exists but is not called is not a permission system.

### D.4 Data integrity concerns
- **Soft delete defeated** — web delete calls `forceDelete()`, destroying records and attachments (B-009).
- **No uniqueness** — `cycles.number` allocated via `max()+1` with no composite unique index (B-032); slug allocation is check-then-insert (B-054).
- **Circular references** — transitive dependency cycles accepted (B-008); `parent_id` self-reference allowed (B-015).
- **Broadcasts fire before commit** (B-035) — listeners can observe state that never commits.
- **CSV formula injection** in exports (SEC-15 / B-042).
- **Audit log unusable** — `AuditService` never writes `workspace_id`, so the tenant audit view is permanently empty (B-018).
- **Missing index** on `requests.workspace_id`, the hottest predicate in the app (B-016).
- **Five vestigial tables** from a previous application remain in the schema (B-049).
- **Not portable to PostgreSQL** — `DATE()` in `selectRaw` (B-023); no PG runtime validation was possible.

---

## E. Test Results

### E.1 Commands executed

| Command | Exit | Result |
|---|---|---|
| `php artisan test` | **0** | **195 passed, 1,055 assertions, 18.00s** |
| `npm run build` | 0 | Client 25 chunks ~1.8 MB gzip; SSR 19 chunks ~137 kB gzip; `AuthenticatedLayout` 660 kB chunk warning |
| `npx tsc --noEmit` | 0 | **Zero TypeScript errors** |
| `npm run lint` | 0 | **0 errors, 75 warnings** (all unused-vars) |
| `./vendor/bin/pint --test` | **1** | **FAIL — 5 files** |
| `./vendor/bin/phpstan analyse` | **127** | **FAIL — binary not installed** (`phpstan.neon` present, Larastan absent) |
| `composer audit` | 0 | No advisories |
| `npm audit` | **1** | **3 vulnerabilities — 2 High, 1 Moderate** |

**Pint failures** (re-verified by Lead Auditor): `database/seeders/DemoWorkspaceSeeder.php`, `app/Http/Middleware/HandleInertiaRequests.php`, `app/Http/Controllers/InboundEmailWebhookController.php`, `app/Http/Controllers/RequestRelationController.php`, `tests/Feature/EdgeCasesAndRaceConditionsTest.php`.

**npm audit**: `browserslist` (High — OOM DoS), `source-map-js` (High — event-loop DoS), `baseline-browser-mapping` (Moderate).

### E.2 Independent re-verification performed by the Lead Auditor

To satisfy the "be skeptical of every documented claim" requirement, the ten highest-severity claims were re-checked directly against source rather than accepted from the sub-reports:

| Claim | Method | Outcome |
|---|---|---|
| F-001 hardcoded Owner credentials | Read `Auth/Login.tsx:24-29,68,316` | **CONFIRMED** — no env guard; rendered unconditionally |
| F-004 Tailwind classes emit no CSS | Counted usages; grepped `tailwind.config.js` + compiled `public/build/assets/*.css` | **CONFIRMED** — 202 usages, 0 CSS rules |
| B-001/SEC-06 unsigned webhook | Read `GitHubWebhookController.php:18-27` | **CONFIRMED** — `if (! empty($secret))` guard |
| SEC-01/B-004 account takeover | Read `InvitationAcceptController.php:42-89` in full | **CONFIRMED** — no signature check, password overwrite, `Auth::login` |
| B-006/SEC-04 2FA unenforced | Listed `app/Http/Middleware/` | **CONFIRMED** — 3 middleware, none 2FA-related |
| B-007/OPS-05 rollover unscheduled | Read `routes/console.php` | **CONFIRMED** — only `inspire`, no `Schedule::` |
| B-005 seeder default password | Read `IndependentWorkspaceSeeder.php:97` | **CONFIRMED** — `?: 'password'` |
| OPS-04 ephemeral APP_KEY | Read `docker/entrypoint.sh:21-23` | **CONFIRMED** — generates key when empty |
| B-010 nullable workspace FK | Grepped migrations | **CONFIRMED** — `workspace_id` nullable on requests/areas/pivot |
| F-002 dead route | Grepped `routes/web.php` vs `Show.tsx:122` | **CONFIRMED** — `requests.files.retry` undefined |
| Full test suite | Ran `php artisan test` | **CONFIRMED** — 195 passed, exit 0 |

### E.3 What the test suite does NOT cover

This is the critical gap: **the suite is green while nine P0s are live.** Notably it contains a test named *"existing user can accept invitation with same username into another…"* — meaning **the takeover behaviour in SEC-01 is asserted as correct behaviour** and would need rewriting, not just adding to. Also untested: the missing-`GITHUB_WEBHOOK_SECRET` path, 2FA enforcement during login (generation is tested; enforcement is not), S3 storage driver, browser/E2E realtime connectivity, supervisord/Docker entrypoint behaviour, and all security-header assertions.

---

## F. Production Blockers (must be fixed before release)

| # | Blocker | ID | Severity | Effort |
|---|---|---|---|---|
| 1 | Invitation acceptance account takeover | SEC-01 / B-004 | **P0** | Medium |
| 2 | Unauthenticated + unscoped GitHub webhook | B-001 / B-003 / SEC-06 | **P0** | Small |
| 3 | Unauthenticated inbound-email webhook | B-002 / SEC-03 | **P0** | Medium |
| 4 | Fail-open tenant isolation (nullable FK + `orWhereNull`) | B-010 / B-014 | **P0** | Medium |
| 5 | 2FA never enforced at login | B-006 / SEC-04 | **P0** | Medium |
| 6 | Login page ships Owner credentials | F-001 / B-005 | **P0** | Small |
| 7 | Cross-tenant user deletion / Area / Cycle IDOR | SEC-02 / SEC-07 / SEC-08 / B-013 / B-030 | **P0** | Large |
| 8 | SSRF with response reflection (Discord) | SEC-05 | **P0** | Small |
| 9 | Stored XSS in Markdown rendering | SEC-10 | **P0** | Medium |
| 10 | Dependency relations controller has no authorization | B-012 | **P0** | Small |
| 11 | Ephemeral `APP_KEY` in Docker | OPS-04 | **P0** | Small |
| 12 | No scheduler → rollover never runs | B-007 / OPS-05 | **P0** | Small |
| 13 | Realtime/presence entirely non-functional | B-017 / F-003 / OPS-03 | **P1** | Large |
| 14 | No security headers; open CORS | SEC-18 / B-055 | **P1** | Small |
| 15 | API v1: no rate limit, no workspace scoping, inconsistent errors | B-025 / B-026 / B-039 / B-056 | **P1** | Medium |
| 16 | PATs never expire; abilities unenforced | SEC-17 | **P1** | Small |
| 17 | Audit log permanently empty | B-018 | **P1** | Small |
| 18 | No automated backups or restore path | OPS-11 | **P1** | Medium |
| 19 | S3 storage driver crashes downloads | OPS-02 | **P1** | Small |
| 20 | Static analysis not actually installed | OPS-07 | **P1** | Small |

---

## G. Implementation Roadmap

### Phase 0 — Critical security & data integrity *(blocks everything)*
| Task | Priority | Depends on | Effort | Area | Acceptance criteria | Regression test |
|---|---|---|---|---|---|---|
| Remove credential overwrite in invitation acceptance; verify signature in `store()`; wrap in transaction | P0 | — | M | Backend | Accepting an invite never mutates `password`, `active`, `two_factor_secret` | Existing-invite test **rewritten** to assert non-mutation |
| Make webhook secret **mandatory** when webhook enabled; add replay window; scope `find()` to workspace | P0 | — | S | Backend/Infra | Unsigned request → 401; missing secret → webhook disabled, not open | Both paths tested |
| Add inbound-email sender verification + HTML sanitization + workspace scoping | P0 | — | M | Backend | Unverified sender cannot create issues or inject comments | Negative-path tests |
| Backfill + `NOT NULL` on `workspace_id`; delete every `orWhereNull` read union; add `scopeVisibleTo` | P0 | — | M | Backend/DB | API, search, export never return another tenant's or orphan rows | Cross-tenant read tests |
| Enforce 2FA at login; require re-auth to disable | P0 | — | M | Backend | Valid password + no TOTP cannot obtain a session | Login challenge tests |
| Remove demo personas from `Login.tsx` or gate on `import.meta.env.DEV` | P0 | — | S | Frontend | Production bundle contains no credential affordance | Build-output grep test |
| Authorise `RequestRelationController`; add transitive cycle detection | P0 | — | S | Backend | Unauthorised relation write → 403; `A→B→C→A` rejected | Policy + cycle tests |
| Remove ephemeral APP_KEY fallback; fail fast when unset | P0 | — | S | Infra | Container exits non-zero without `APP_KEY` | Entrypoint test |
| Fix Discord SSRF: host allowlist, no body reflection | P0 | — | S | Backend | `169.254.169.254` rejected 422 | Validation test |
| Escape Markdown output in TipTap | P0 | — | M | Frontend | `<img onerror>` renders as text | XSS regression test |

### Phase 1 — Essential broken & incomplete features
| Task | Priority | Depends on | Effort | Area | Acceptance criteria | Regression test |
|---|---|---|---|---|---|---|
| Add cycle creation UI + wire `cycles.store`; add ticket→cycle control | P1 | Phase 0 | M | Full-stack | A user can create a cycle and move a ticket into it | Feature test |
| Register `relay:cycle-rollover` in scheduler + supervisord | P1 | Phase 0 | S | Infra | Rollover fires on schedule, idempotently | Command + schedule test |
| Fix dead routes (`requests.files.retry`), `/profile/tokens` | P1 | — | S | Backend/Frontend | Every rendered control maps to a real route | Route-existence test |
| Add password reset flow end-to-end | P1 | — | M | Full-stack | Reset email → valid token → new password | Feature test |
| Fix `zinc-650/750/850` (define or replace 202 usages) | P1 | — | S | Frontend | Compiled CSS contains rules for every used class | Build-assertion test |
| API v1 hardening: rate limit, workspace selection, error shape, policy enforcement | P1 | Phase 0 | M | Backend | Documented params work; cross-workspace writes rejected | API contract tests |
| PAT expiry + abilities | P1 | — | S | Backend | Tokens expire; abilities enforced | API tests |
| Fix realtime: add `laravel-echo` + Reverb or remove all realtime UI | P1 | — | L | Full-stack | Cross-user update visible, or no misleading presence UI | E2E test |
| Add security-headers middleware + `config/cors.php` | P1 | — | S | Backend | CSP/HSTS/X-Frame-Options present; CORS restricted | Header assertions |

### Phase 2 — Testing, deployment & reliability
Install Larastan and enforce level 6 in CI · add `.env`/APP_KEY preflight to `relay:doctor` · browser/E2E suite · automated backup + **tested restore** · pin `mailpit` image · add app healthcheck · replace monolithic log with stdout · fix `opcache.fast_shutdown` · correct README drift · fix the 5 Pint failures · fix the 3 npm advisories.

### Phase 3 — Important UX & performance
N+1 `files_count` eager-load (B-011) · index `requests.workspace_id` (B-016) · cache `hasPermission()`/`currentWorkspace()` (B-045/B-046) · code-split `AuthenticatedLayout` (660 kB) · fix bulk-action error swallowing (F-009) · complete 409 coverage (F-029) · accessibility pass (focus traps, listbox semantics, contrast) · add swimlanes/milestones/saved filters/nested-issue UI · responsive layout.

### Phase 4 — Optional enhancements
Issue templates · custom fields · CSV import · advanced search · global saved filters · theme toggle · mobile-first navigation.

---

## H. Release Decision

### Decision: **NO-GO**

### Justification

The decision rests on the mission's own criterion: *"Confirmed P0/P1 blockers or essential safety/release gates remain unverified."* Both conditions are met, and the first is met unambiguously.

**1. Confirmed P0 findings exist — nine of them, independently re-verified.** Under the stated severity definitions, these include exploitable security issues (SEC-01 takeover, SEC-05 SSRF, B-001/B-002 unauthenticated writes), tenant data leakage (B-010/B-014, SEC-02), and catastrophic operational failure (OPS-04 ephemeral `APP_KEY` destroying sessions and tokens on every container restart). A NO-GO is mandated by the rubric alone.

**2. The security boundary is architecturally fail-open.** This is what elevates the verdict beyond "a list of bugs". Isolation depends on `workspace_id !== null`; verification depends on an operator remembering to set a secret; 2FA depends on nothing at all. These are not missing features — they are decisions that make the safe path the opt-in path. Until they are inverted, new endpoints will keep inheriting the same defect.

**3. An unverified security-critical requirement must not be silently treated as passing.** Here the inverse is worse: several critical requirements are not merely unverified but **tested and locked in as correct**. The suite contains a passing test asserting that an existing user may accept an invitation into another workspace — the exact shape of SEC-01. A green suite is therefore *evidence against* safety here, and 195 passing tests cannot offset that.

**4. Documentation is actively misleading on the security-relevant surface.** The login page advertises Owner credentials in production, the presence widget asserts "1 viewing now" with no transport behind it, and the 2FA panel reads "Enabled & Enforced" when enforcement does not exist. Each claims a guarantee the system does not provide — the worst failure mode for a self-hosted product, where the operator is the trust boundary.

**5. Release gates are unverified, not merely unmet.** No browser or E2E test, no working static analysis, no backup or restore drill, no scheduler in the production container, and no PostgreSQL validation.

### What would move this to CONDITIONAL GO

Remediating all nine P0 findings, adding the corresponding regression tests (including **rewriting** the invitation test that currently asserts the vulnerable behaviour), and re-running the audit's verification set — with the realtime surface either made functional or removed so it stops making false claims.

### What would move this to GO

All of the above, plus the Phase 1 essential gaps closed, plus verified backup/restore and a working static-analysis gate in CI.

**A CONDITIONAL GO is not available.** It requires *no known P0/P1 findings*. Nine P0 findings are confirmed and reproducible from source.

---

## Appendix — Audit Method & Integrity Statement

**Method.** Repository inventoried directly (not from documentation). Four specialist audits dispatched in parallel with strictly separated scopes and a read-only constraint; each produced a Markdown report with mandatory per-finding structure, unique IDs, severity, evidence, root cause, fix, effort, and regression-test requirement. The Lead Auditor then independently re-verified the ten highest-severity claims against source, reproduced the full test suite, reconciled cross-agent agreement and disagreement, and consolidated this report.

**Cross-agent reconciliation.** Agents 1 and 4 independently reported **195 tests / 1,055 assertions passing** against MySQL `stm_testing` — genuine independent agreement, and reproduced by the Lead Auditor. Agents 1, 2 and 4 converged independently on the real-time stack being entirely absent (`window.Echo` never assigned, no Echo/Reverb dependency, no `config/broadcasting.php`), each finding it from a different layer. **No unresolved contradictions remain between agents.**

**Integrity statement.** No application source file was modified during this audit; `git status` shows only the new untracked `reports/` directory. No production system, external service, webhook endpoint, or email transport was contacted. No destructive database command was run against any existing database. No secret, token, password, or API key is reproduced in any report — all such values are redacted as `[REDACTED]`. No benchmark number, file path, line number, test result, or error message in any of these reports was invented; where evidence was unavailable the item is marked NOT ASSESSED with the reason stated.