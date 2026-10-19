# Relay Studio — Pre-Production Security Audit (Agent 3)

**Document ID:** SEC-AUDIT-2026-RELAY-03
**Target:** Relay Studio (`/Volumes/Main/Herd/stm`, git `main`, clean tree, HEAD `94ce903`)
**Reviewer:** Senior Application Security Engineer (audit-only; no source/config/migration changes)
**Date:** October 19, 2026
**Gate status:** **FAILED — PRE-PRODUCTION DEPLOYMENT BLOCKED**
**Finding counts:** P0 = 3 · P1 = 12 · P2 = 7 · P3 = 3 · Total = 25

---

## 1. Methodology, Scope & Limitations

### 1.1 Method

White-box, static, source-assisted audit. Findings were traced source→sink (route → middleware → controller → form request → policy → service/job → model → view/serializer → frontend renderer). No live exploitation (`phpunit` not run — reserved for Agent 4; no HTTP writes; no DB mutations; no external calls; no installs). All scratch work was read-only; repository write limited to this file.

### 1.2 Commands executed (read-only)

| Command | Result |
|---|---|
| `git status`, `git log --oneline` | clean tree; HEAD `94ce903` |
| `php artisan about` | Laravel 13.33.0, PHP 8.4.22, env `local`, **Debug ENABLED**; **Broadcasting driver = `log`**; session/cache = database |
| `php artisan route:list --json` | Full route/middleware inventory used for the matrix in §6 |
| `grep`/`read` across `routes`, `app`, `database`, `config`, `resources`, `tests`, `Dockerfile`, `.github` | Evidence citations inline |
| lockfile inspection (`composer.lock`, `package-lock.json`) | Versions only; CVE auditing explicitly deferred to Agent 4 |

### 1.3 Confirmed environment facts

- `laravel/reverb`, `pusher/pusher-php-server`, `laravel-echo`, `pusher-js` are **not installed** (composer.lock / package.json). No `config/broadcasting.php`, no `config/reverb.php`, no `config/cors.php`. **Real-time WebSocket claims are false in this build** (see §9).
- `.env` is local/dev: `APP_DEBUG=true`, `APP_ENV=local`, broadcast/mail = `log`. It is **not production-safe**. `GITHUB_WEBHOOK_SECRET`, `DISCORD_WEBHOOK_URL`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_SECRET` are **not set** in `.env` (key-presence check only; values never printed). Consequence: GitHub webhook signature verification is **fail-open today** (SEC-009).
- Roles that actually exist in code: **Owner, Developer, Designer** only (`app/Enums/RoleName.php`). The brief's "Admin/Member" roles do not exist.
- `tests/Feature/*` contains security-oriented tests (MultiTenancy, AuthorizationLockdown, SecurityHardening, etc.); they were **read but not executed**. Notably, none cover the P0/P1 cross-tenant IDORs in SEC-001/005/006/007.

### 1.4 Disclaimer

This is a point-in-time source review of one commit. Absence of a finding is not proof of absence. Dynamic confirmation (authorized staging runs by Agent 4 / the remediation owner) and dependency CVE scanning remain outstanding.

---

## 2. Executive Summary & Attack Chains

Relay Studio's request-centric flows are reasonably protected once a workspace is resolved: `WorkRequestPolicy` consistently checks `belongsToWorkspace()` plus per-action permissions, comments/files/subtasks/clone all call `authorize()`, mass assignment is constrained by `$fillable`, CSRF is active on all `web` routes, login throttling exists, and TOTP secrets are encrypted at rest. However, the workspace boundary is **not consistently enforced**, the installed role model collapses `Developer` into an administrator, and two webhook integrations accept attacker-controlled identity.

**Most realistic end-to-end path (validated by code trace):**

```
Anonymous / any GitHub account
  → OAuth self-registration (`/auth/github/callback`, enabled by configured client_id)
  → global role = Developer (SEC-003) whose permission set contains ALL 12 permissions
  → `permission:manage_workspace` middleware passes
  → PATCH /settings/team/{any-user-id} (no workspace scoping, no self-check)   [SEC-001]
  → set that user's global role_id = Owner and/or overwrite password
  → full control of every workspace's users and data
```

Equivalent alternatives: unauthenticated `POST /api/webhooks/inbound-email` impersonates any member and injects comments into any workspace whose request IDs are known (SEC-002); any authenticated workspace-less account reads every tenant's requests/exports/search results (SEC-004).

---

## 3. Findings — P0 (Critical)

### SEC-001 · P0 · Cross-tenant user modification/deletion, self-escalation and account takeover
**Spec:** C — Permissions; B — Multi-tenancy
**Location:** `app/Http/Controllers/TeamMemberController.php:108-139` (`update`), `:141-163` (`destroy`), `:178-181` (`ensureCanManage`)
**Observed:** `update(Request $request, User $user)` and `destroy(Request $request, User $user)` bind the target user **by raw ID**, then check only `hasPermission('manage_team')` on the actor. There is **no check that `$user` belongs to the actor's active workspace** — not via `settings/team` group middleware (only `permission:manage_workspace`, evaluated against the actor's **global** `users.role_id`), not via a policy (`UserPolicy` is never called here), not in the form validation.
The `update` payload accepts `role_id` (validated only as "exists in roles and is Owner/Developer/Designer" — Owner included) and `password` (min 8). The actor may target **themselves** (`destroy` blocks self, `update` does not).
**Expected:** Team mutation must be limited to members of the active workspace, cannot change global role state, and cannot target self for privilege elevation.
**Evidence:**
- `TeamMemberController.php:115` — `'role_id' => [...Rule::exists('roles','id')->where(... ['Owner','Developer','Designer'])]`
- `:127` — `$user->update($validated)` writes **global** `users.role_id` and password.
- `app/Models/User.php:31,79-82,144-160` — role is a single global `belongsTo(Role::class)`; `hasPermission('manage_team')` consults it.
- `SettingsController.php:94-97` lists only the active workspace's users in the UI, but the endpoint accepts any ID → IDOR.
**Root cause:** The workspace pivot (`workspace_user.role_id`) exists but is never used for authorization; identity/role state is global while the UI and intent are per-workspace. Endpoint-level ownership checks were omitted.
**Impact:** A `manage_team` holder in one workspace (Developer or Owner) can change the global role of any user in any workspace to **Owner**, reset their password, deactivate/activate them, or permanently delete their account. Combined with SEC-003 this is anonymous-to-full-compromise. Also self-escalation Developer→Owner.
**Remediation:** Scope target lookup through `$actor->currentWorkspace()->users()->whereKey($user->id)`; delete `role_id`/`password` from team-update or require password re-auth; forbid self role change; derive permissions from the pivot `role_id`, not `users.role_id`; add policy checks. Effort: M.
**Regression test:** two workspaces, user with `manage_team` in A; assert 404/403 when patching/deleting a B member; assert self role change rejected; assert password change requires re-auth.

### SEC-002 · P0 · Unauthenticated inbound-email webhook: member impersonation & cross-tenant comment injection
**Spec:** E — Integrations; C — Authorization
**Location:** `routes/api.php:25`; `app/Http/Controllers/InboundEmailWebhookController.php:15-124`
**Observed:** The endpoint is public (`api` group only). Identity is taken verbatim from attacker-controlled JSON: `From` (any of several keys) is regex-parsed into an email (`:18-33`), the user is loaded by that email (`:84`), and if active and (when ticket has a workspace) a member, the attacker-supplied body is stored as a comment **authored by that user** (`:116`). Gating is only: ticket ID exists (`:78`), sender email exists, sender active, sender belongs to ticket workspace (`:93`). No HMAC/shared-secret, no SPF/DKIM, no per-tenant inbound address binding, no rate limit.
**Expected:** Inbound mail must be authenticated to the mail provider (signature or allow-listed source), and author identity must come from an authenticated mapping, never from message headers/body.
**Evidence:** Field reads at `:18-24, :40-48, :61-70, :98-108`; lookup `:84`; membership gate `:93`; comment creation `:116`. The responses also form an enumeration oracle (`:80` ticket exists, `:86` email exists, `:90` inactive, `:94` not member).
**Impact:** Any internet attacker who can guess/observe a `REQ-<id>` can impersonate any active user (whose email is discoverable via SEC-018) and inject arbitrary content into that workspace; content fans out through DB notifications, transactional email, and Discord embeds (phishing/social-engineering). Unauthenticated write primitive.
**Remediation:** Require provider HMAC on the raw body, compare with `hash_equals`, reject when unset (fail-closed); mint a per-workspace reply address containing an unguessable token mapping to the workspace/request; treat `From` as untrusted metadata only; rate-limit; stop echoing internal state in errors. Effort: M.
**Regression test:** unsigned POST to the route is 401/403; signed POST with mismatched sender email is rejected; inactive user rejected.

### SEC-003 · P0 · OAuth auto-registration grants global “Developer” role that holds every permission
**Spec:** A — OAuth; C — RBAC escalation
**Location:** `app/Http/Controllers/Auth/SocialAuthController.php:47-87` (esp. `:58, :70-79`); `database/migrations/2026_10_18_000020_sync_core_permissions.php:31-39`
**Observed:** Any social login with no matching user is auto-created (`:67-79`) with `role_id` = global `Developer` role (fallback: first role in table). That migration applies **all 12 permissions** — including `manage_workspace`, `manage_team`, `manage_roles`, `delete_requests` — to Developer. There is no email-verification requirement and no admin approval; the feature can be toggled on by any Owner (`SettingsController::toggleOAuthProvider`) and is auto-enabled when client credentials are configured (`app/Services/SocialAuthService.php:44-47`), including **true by default in the testing environment** (`:41-43`).
**Expected:** Self-service signup must receive a least-privilege role confined to an approved workspace, and must never receive workspace/team management capabilities.
**Evidence:** Role seeding (`sync_core_permissions.php:26-33` developer `syncWithoutDetaching($allPermissionIds->values())`); social user creation `SocialAuthController.php:70-79`. Account-linking by unverified provider email (`:52-55`) is a secondary concern (provider-dependent).
**Impact:** Any GitHub/Google account holder (if the provider is enabled) obtains full administrative permission set globally. Chained with SEC-001 (target arbitrary user IDs, including self) this is unauthenticated-to-owner account takeover. Even without SEC-001, Developer can configure integrations (SSRF, SEC-012), toggle OAuth, manage projects of any workspace it can reach through IDOR endpoints, and export all data (SEC-004).
**Remediation:** Introduce Member role with minimal permissions; auto-provision as Member attached to no workspace or an invite-only workspace; remove `manage_*` from Developer; require verified provider email; make OAuth enablement opt-in (`AUTH_*_ENABLED=false` default). Effort: M.
**Regression test:** OAuth-created user has no management permissions and no foreign-workspace data access.

---

## 4. Findings — P1 (High)

### SEC-004 · P1 · Workspace-less accounts see all tenants (requests, exports, search, users, dashboards)
**Spec:** B — Multi-tenancy; A — auth lifecycle
**Location:** `app/Http/Controllers/WorkRequestController.php:43-54`; `app/Http/Controllers/ExportController.php:19-23`; `app/Http/Controllers/GlobalSearchController.php:33-44`; `app/Http/Controllers/Api/V1/WorkRequestApiController.php:31-37`; `app/Services/DashboardService.php` (`when($workspaceId, …)`); `RoadmapController.php:36-37,73`
**Observed:** Every listing scopes with `->when($activeWorkspace, …)`. When `currentWorkspace()` is `null` — e.g., a freshly OAuth-registered user, or a user removed from their last workspace (fallback returns null, `User.php:96-109`) — the filter is skipped entirely and the query runs **unscoped** across all workspaces. `ExportController` additionally has **no policy check at all** (auth+active only), and `WorkRequestController::index` ships the global user directory (`:68`).
**Expected:** No active workspace ⇒ empty result, not global result.
**Evidence:** `WorkRequestController.php:44` `.when($activeWorkspace, fn ($q) => $q->where('workspace_id', …))`; `ExportController.php:20` identical pattern with `orWhereNull('workspace_id')`; search `:34`; `User::currentWorkspace()` fallback `:108`.
**Impact:** Cross-tenant read of every request (titles, descriptions, assignees) and full CSV/JSON export; user directory (names, usernames, roles) exposure; `orphan` requests with `workspace_id = NULL` leak to every user even when a workspace is active (`orWhereNull`).
**Remediation:** Fail closed: if no current workspace, abort/empty; never `orWhereNull` unless explicitly designed; add `viewAny` policy gate to export; scope the user directory to the workspace membership. Effort: S.
**Regression test:** user with no membership receives empty lists/403 and cannot export.

### SEC-005 · P1 · Request relations: no authorization, unscoped bindings, cross-tenant writes
**Spec:** B/C — Authorization; F — realtime-adjacent state
**Location:** `app/Http/Controllers/RequestRelationController.php:16-110` (`store`), `:96-186` (`destroy`)
**Observed:** Neither method calls `$this->authorize()`, checks permission, or verifies the actor belongs to the target request's workspace. The route binds `{request}` by ID (`routes/web.php:50-51`) and `related_id` is validated only with `exists:requests,id`. The cross-workspace guard (`:47-50`) only rejects when **both** sides are non-null and different — so a user can link two requests in a foreign workspace (or involving null-workspace rows) and set `is_blocked = true` on a foreign request (`:70-77`).
**Expected:** `comment`/`update` permission + workspace membership of both endpoints.
**Impact:** Any authenticated user can alter dependency state (block/unblock flags, relation graph) of any other workspace; integrity and notification spam.
**Remediation:** `authorize('update')` on target + explicit `belongsToWorkspace` on both requests; scope `related_id` with a workspace-constrained `Rule::exists`. Effort: S.
**Regression test:** foreign-workspace relation create/delete is 403.

### SEC-006 · P1 · Cycle rollover/creation without authorization; unscoped cycle binding
**Spec:** B/C — Authorization
**Location:** `app/Http/Controllers/CycleController.php:125-129` (`rollover`), `:93-123` (`store`), route `routes/web.php:60`; service `app/Services/CycleService.php:139-196`
**Observed:** `rollover(Cycle $cycle)` binds any cycle by ID and executes immediately — no policy, no workspace check, no permission; any authenticated user can close another tenant's active cycle and roll its unfinished tickets into a new cycle in that workspace. `store` similarly creates cycles with no permission check.
**Impact:** Cross-tenant state destruction/integrity (cycle close, ticket reassignment, burndown corruption), audit noise.
**Remediation:** authorize `manage_workspace`/`manage_areas`-equivalent and assert `$cycle->workspace_id === currentWorkspace`; same for `store`. Effort: S.

### SEC-007 · P1 · Area (project) update/archive/reorder cross-tenant IDOR
**Spec:** B — Multi-tenancy
**Location:** `app/Http/Controllers/AreaController.php:45-72` (`update`), `:74-87` (`reorder`), `:89-104` (`destroy`)
**Observed:** All three resolve `Area $area` (or raw area IDs in `reorder`) and check only `hasPermission('manage_areas')` on the actor. No `$area->workspace_id === $actor->currentWorkspace()->id` check; `reorder` validates `exists:areas,id` with no workspace constraint and updates sort order of any project globally.
**Impact:** Cross-tenant rename/color/archive/sort manipulation, including archiving a competitor's project; audit entries mislabeled into the actor's context.
**Remediation:** Scope every lookup through the current workspace (route binding `->scopeBindings()` or explicit comparison); validate `order.*` against workspace areas. Effort: S.

### SEC-008 · P1 · Stored XSS via document uploads served inline (extension OR MIME acceptance)
**Spec:** D — File handling
**Location:** `app/Services/RequestFileService.php:34-68`; `app/Http/Controllers/RequestFileController.php:72-91`
**Observed:** Classification accepts a file if the detected MIME is in the document list **or** the client-supplied extension is in `['pdf','log','txt','text','json','zip','csv','md','markdown','doc','docx','xml']` (`:58`). `$mime` is stored from server detection (`:34,85`) and `show()` serves the stored file with `Content-Type: $file->mime_type` and `Content-Disposition: inline` (`:87-90`). An attacker uploads `x.doc` (or `x.xml`) whose bytes are HTML; finfo yields `text/html`, extension check passes, file is stored byte-for-byte, and the victim's browser renders it as **HTML on the application origin**.
**Expected:** Serve untrusted documents as `application/octet-stream`/`attachment`; enforce MIME-authoritative, extension-consistent allow-lists; add `X-Content-Type-Options: nosniff`.
**Impact:** Persistent XSS in an authenticated member's session (can chain to CSRF-token theft/actions as the victim; session cookies are HttpOnly but same-origin JS can still act). Requires upload permission — Developer/Designer/Owner all have `upload_request_files`.
**Remediation:** Force `attachment` disposition for documents, normalize content type from allow-list, sniff with finfo only, add CSP + nosniff. Effort: S.
**Regression test:** upload HTML bytes named `.doc`; assert served as attachment/octet-stream and no JS execution.

### SEC-009 · P1 · GitHub webhook: fail-open signature check, no replay/idempotency, unauthenticated auto-done
**Spec:** E — Integrations
**Location:** `app/Http/Controllers/GitHubWebhookController.php:19-29` (signature), `:31-137` (PR path), `:85-115` (auto-done), `routes/api.php:24` (no throttle)
**Observed:** HMAC-SHA256 over the raw body with `hash_equals` is correct **only when a secret exists**; if `config('services.github.webhook_secret')` and the `webhooks.secret` row are both empty the entire verification block is skipped (`:22` `if (! empty($secret))`). This repository's `.env` has no `GITHUB_WEBHOOK_SECRET` (and no seed fills `webhooks`). No `X-GitHub-Delivery` de-duplication and no replay window; on `pull_request` merged to `main/master/''` any referencing ticket is forcibly moved to `done` with an activity entry (`:85-114`), attributed to no human actor and bypassing policies.
**Expected:** Fail closed when secret is unset; persist delivery IDs for idempotency; auto-transition requires a configured, authenticated repository binding.
**Impact:** With defaults, an anonymous attacker can create/link PR records and, more importantly, **mark arbitrary workspace tickets “done”** (integrity/DoS) and inject activity content. With a secret configured, replay of captured deliveries still re-triggers transitions.
**Remediation:** Reject when secret is empty; require per-workspace repo secrets (webhooks table is global — see SEC-013); record delivery IDs; rate-limit. Effort: M.

### SEC-010 · P1 · 2FA is enrollment-only: never challenged at login; disable/regenerate unauthenticated by password
**Spec:** A — Authentication
**Location:** `routes/auth.php:9-21` (login flow), `:29-39` (management); `app/Http/Controllers/Auth/AuthenticatedSessionController.php:31-42`; `app/Http/Controllers/Auth/TwoFactorAuthController.php:73-114`
**Observed:** `LoginRequest::authenticate()` checks only credentials + active + role; there is no TOTP challenge route or session flag, and `two_factor_recovery_codes` are never consumed anywhere (grep: only generation/regeneration). `disable` (`:73-89`) and `regenerateRecoveryCodes` (`:91-114`) require only an authenticated session — no password or current OTP re-auth. `confirm` allows unlimited code attempts (no throttle) and codes are not single-use within their window.
**Impact:** Users who believe they are protected get zero additional security; a session-riding attacker (or XSS per SEC-008) can silently disable 2FA. Compliance/claims mismatch.
**Remediation:** Add a login challenge step (`two_factor_confirmed_at` gate + pending-session marker), throttle + replay-protect codes, require password/OTP before disable/regenerate. Effort: M.
**Regression test:** password-only login on a 2FA-enabled account must not reach the dashboard.

### SEC-011 · P1 · Invitation acceptance: mutation endpoint skips signature; overwrites existing user password
**Spec:** A/B — Invites
**Location:** `app/Http/Controllers/InvitationAcceptController.php:19-40` (`show`), `:42-90` (`store`); `routes/web.php:31-32`; `app/Mail/WorkspaceInvitationMail.php:21-27`
**Observed:** `show()` verifies `hasValidSignature()` (`:21`), but the **state-changing** `store()` verifies nothing except token existence/expiry (`:44-48`). If the invitation email matches an existing user, `store()` **overwrites that user's password** and activates them (`:59-66`) with no current-password and no mail-confirmation step; the GET response also returns the raw token in Inertia props (`:33`). Tokens are 40-char `Str::random` stored in plaintext, no single-use enforcement race (delete after login, `:85`), no throttling.
**Expected:** Signature-verified POST; token bound to the invited email with no account overwrite for existing users; single-use semantics.
**Impact:** Anyone who obtains a raw token (logs, referrer, screenshot, proxy) can accept without the signature and, for an existing user, take over that account by resetting its password. Also permits mixing an invitation with an existing account whose password the inviter may not control.
**Remediation:** Require `hasValidSignature()` on POST; refuse password overwrite (invite-only flow should require login or send a set-password/reset mail); rotate + single-use with `lockForUpdate`; throttle. Effort: S.

### SEC-012 · P1 · SSRF + persistent notification exfiltration via Discord integration (arbitrary URL)
**Spec:** E — Integrations; D — SSRF
**Location:** `app/Http/Controllers/IntegrationController.php:97-103`; `app/Services/DiscordNotificationService.php:310-395` (`ping`), `:41-60` (`getWebhookUrl`), `:98-119` (`updateSettings`); `app/Http/Requests/Integration/TestDiscordRequest.php` (`['nullable','string','url','max:500']`)
**Observed:** `testDiscord` posts to any user-supplied URL (`Http::timeout(6)->post($webhookUrl, $payload)`), returning the upstream status and **response body** in the JSON error (`:364, :377`). `updateDiscord` persists any URL into the cache, which then receives the payloads of **all workspaces'** ticket events (titles, statuses, assignees, blocked reasons, URLs). Requires `manage_workspace` — held by Owner and Developer.
**Expected:** Destination allow-list (`discord.com/api/webhooks/*`), SSRF-resistant fetch policy (deny private/loopback/link-local, redirect control), no response reflection, no persistence of arbitrary hosts.
**Impact:** Authenticated admin can make the server probe internal services (metadata endpoints, internal admin panels) and exfiltrate tenant ticket data to an attacker endpoint; response body leak promotes blind SSRF to semi-blind.
**Remediation:** Enforce Discord host pattern; block private ranges with DNS re-resolution checks; don't echo upstream bodies; store per-workspace integration URL. Effort: M.

### SEC-013 · P1 · Outgoing webhooks are global: every tenant's urgent/blocked tickets broadcast to every configured hook
**Spec:** B/E — tenant isolation of integrations
**Location:** `app/Jobs/DispatchOutgoingWebhook.php` (destinations `:128-145`); `app/Models/Webhook.php`; `database/migrations/2026_10_18_000004_create_webhooks_table.php` (no `workspace_id`)
**Observed:** When a request becomes urgent or blocked, the job loads **all active webhooks** (`Webhook::where('is_active', true)->get()`) and posts full payloads (title, project, assignee, blocked reason, direct URL) to each. There is no workspace column on `webhooks`; a hook configured for tenant A receives tenant B's data.
**Expected:** Integrations must belong to a workspace and disclose only that workspace's events.
**Impact:** Cross-tenant data leakage and business-data exfiltration to any party who can register a webhook (seeding/admin surfaces) — a direct confidentiality-boundary failure.
**Remediation:** Add `workspace_id` to webhooks, scope the destination query, per-workspace secrets. Effort: M.

### SEC-014 · P1 · API authorization is weaker than web: status/assign bypass, Decorative Sanctum abilities, non-expiring tokens
**Spec:** A/C — API permissions
**Location:** `app/Http/Controllers/Api/V1/WorkRequestApiController.php:85-113`; `app/Http/Controllers/PersonalAccessTokenController.php:25-49`; `config/sanctum.php:53`
**Observed:**
1. Web updates require `changeStatus` when `status` is present and `assign` when `assignee_id` is present (`app/Http/Requests/WorkRequest/UpdateWorkRequestRequest.php:17-33`); the API `update` only calls `authorize('update')` — a user with `edit_requests` but **without** `change_request_status`/`assign_requests` (e.g., a narrowed custom role) can change both via API. The Designer requester-only constraint in `WorkRequestPolicy::update` still applies to the API path because `authorize('update')` runs, so only the granular status/assign gates are missing.
2. Token abilities are stored but **never checked** (`grep tokenCan` → no matches); any token, even created with `abilities: ['read']`, exercises every API route. `expiration => null` and `expires_at` optional (`PersonalAccessTokenController.php:31`) → tokens never expire unless explicitly set.
3. `ProjectApiController::index` has no `authorize()` at all.
**Impact:** Principle of least privilege defeated for machine credentials; a read-scoped token can delete requests. Long-lived tokens widen compromise windows.
**Remediation:** Route-level ability checks (`ability:requests:write`), default expiry, require `change_status`/`assign` in API validators, add policy gate to projects endpoint. Effort: M.

### SEC-015 · P1 · Cross-tenant reference injection through unscoped `exists` rules (`area_id`, `cycle_id`, `parent_id`, `assignee_id`)
**Spec:** B — Multi-tenancy / data integrity
**Location:** `app/Http/Requests/WorkRequest/UpdateWorkRequestRequest.php:27-41`; `app/Http/Requests/WorkRequest/BulkWorkRequestRequest.php:33-42`; `app/Http/Controllers/Api/V1/WorkRequestApiController.php:51-65,93-108`; `app/Services/WorkRequestService.php:22-43`
**Observed:** `area_id` uses `Rule::exists('areas','id')` (country-wide), `cycle_id` `exists:cycles,id`, `parent_id` `exists:requests,id`, `assignee_id` `exists:users,id` — none constrained by the request's workspace. Subtask creation additionally copies `area_id`/`cycle_id` from the parent (safe), but direct updates can repoint a ticket into another tenant's area/cycle or under a foreign parent.
**Impact:** Cross-tenant data integrity corruption; a ticket appears in another tenant's project/burndown; assigned foreign users receive notifications and links they cannot open; parent/child trees span tenants.
**Remediation:** Scope each rule to `where('workspace_id', $request->workspace_id)` (and `users` to workspace members); validate parent/cycle in the same workspace. Effort: S.

---

## 5. Findings — P2 (Medium)

### SEC-016 · P2 · Audit log never records `workspace_id`; incomplete coverage; mutable, no retention
**Location:** `app/Services/AuditService.php:20-37`; `app/Http/Controllers/SettingsController.php:35-41,52-59`; `database/migrations/2026_10_18_000003_create_workspace_audits_table.php` + `…000011…` (nullable workspace FK)
`AuditService::log()` builds `WorkspaceAudit::create([...])` without `workspace_id`. The settings audit query filters `where('workspace_id', $activeWorkspace->id)` → the UI shows nothing for real events (all rows are NULL-scoped) and there is no per-tenant segregation. Coverage is partial: member/project/integration/OAuth events only; **no** login/logout, password/2FA changes, request create/update/delete, file upload, export, or token events. Rows are plain mutable DB records — no append-only/hash-chain. Actor deletion nulls attribution (`nullOnDelete`).
**Impact:** Governance/forensic gap; PII (emails in `old_values`) is stored unscoped and visible only through unscoped queries; no reliable non-repudiation.
**Remediation:** Populate workspace_id from the auditable object/current context; add the missing event families; append-only storage with hash chaining; documented retention; test coverage.

### SEC-017 · P2 · CSV formula injection in export
**Location:** `app/Http/Controllers/ExportController.php:80-106`
`fputcsv` protects delimiters but not spreadsheet formulas: `title`, `project`, `assignee`, `requester` starting with `= + - @` (or tab/CR) execute in Excel/Sheets when the exported file is opened. Mitigate by prefixing `'` / `\t` for leading formula characters. Effort: S.

### SEC-018 · P2 · Cross-tenant directory and delivery-log disclosure
**Location:** `app/Http/Controllers/SettingsController.php:94-97` (falls back to `User::query()->…->get()` — **all users with emails** — when the active workspace has no members or is null); `app/Http/Controllers/WorkRequestController.php:68,85` (global active users list to every viewer); `app/Http/Controllers/IntegrationController.php:29-45` (delivery logs are global — channels, target masked/email, summaries containing ticket titles, error messages — visible to any `manage_workspace`).
**Impact:** Email addresses from other tenants are exposed (supporting SEC-002 impersonation), plus notification payload metadata. Remediation: scope both queries to workspace membership; scope delivery logs by workspace_id (column exists but is not filtered).

### SEC-019 · P2 · Transport/session/header posture unset for production
**Location:** `config/session.php:173` (`secure` ← `SESSION_SECURE_COOKIE`, unset), `:203` (`same_site` default lax), `.env` (no secure/domain overrides), `config/sanctum.php:20-27` (stateful defaults localhost + app URL), absence of `config/cors.php` (framework default `allowed_origins: ['*']` for `api/*`, credentials off), no middleware adding `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. Ignition routes (`/_ignition/execute-solution`) are registered in this local environment (dev-only package; Docker build uses `--no-dev`, so absent in the container — but any `composer install` with dev deps + `APP_DEBUG=true` in prod is a code-execution path).
**Remediation:** env-driven `SESSION_SECURE_COOKIE=true`, explicit stateful domains, add security headers middleware, never ship dev deps or debug in production.

### SEC-020 · P2 · Rate limiting only on login: webhooks, uploads, comments, search-web, API mutations unbounded
**Location:** `routes/auth.php:14` (`throttle:6,1` login only); `routes/api.php:10` (60/min search only); `routes/api.php:24-25` (webhooks none); `routes/web.php` (no throttle on comments/files/bulk/export/relations/cycles).
**Impact:** After authentication (or anonymously on webhooks) a client can flood comments (each fans out notifications + email + Discord), upload 64 MB files (ffmpeg jobs), bulk-create 250+ requests per call, and repeatedly trigger exports — resource exhaustion and notification abuse. Remediation: per-user/per-route throttles, upload quotas, webhook rate limits, queue concurrency caps.

### SEC-021 · P2 · No email verification; provider email trusted for account linking; profile email change unverified
**Location:** `app/Http/Requests/ProfileUpdateRequest.php:27-32` (email change allowed without verification); `app/Http/Controllers/Auth/SocialAuthController.php:52-55` (link by provider email); no verification routes in `routes/auth.php`.
**Impact:** Enables identity-linking abuse if a provider returns an unverified/attacker-controlled address (provider-dependent), and lets a compromised session permanently rebind the recovery identity of an account. Remediation: add verification; require existing-password + notification mail on email change; only auto-link on provider-verified `email_verified`.

### SEC-022 · P2 · Integration delivery logs store full payloads/PII globally
**Location:** `discord`/`email` log creation in `DiscordNotificationService.php:275-299`, `EmailNotificationService.php:151-173`, `SendRequestEmail.php` (summary + `payload` JSON), surfaced via `IntegrationController.php:35-45`. Emails of recipients and ticket content are retained in plaintext DB without retention policy; combined with SEC-018 any `manage_workspace` actor of any tenant can read them once scoping is fixed only partially. Remediation: redact payloads, scope by workspace, retention.

---

## 6. Findings — P3 (Low)

### SEC-023 · P3 · Session/token lifecycle gaps on credential change
`PasswordController::update` (`app/Http/Controllers/Auth/PasswordController.php:17-31`) does not invalidate other sessions or revoke PATs after a password change; there is no password-reset or email-verification flow at all; `logout` is correct. Remediation: `Auth::logoutOtherDevices`/session table purge + token revocation.

### SEC-024 · P3 · Media processing resource exhaustion and header robustness
`RequestFileProcessingService` runs Imagick/GD on attacker bytes and ffmpeg with `setTimeout(3600)` (`:185`) while the queue worker uses `--tries=3 --timeout=90` (`docker/supervisord.conf`) → jobs are killed and retried; 64 MB uploads sampling up to 3600 s of transcode are a cheap DoS lever. `RequestFileController::show:89` builds `Content-Disposition` from `addslashes($file->original_name)` — CR/LF are not stripped (header-injection is blocked by Symfony's header validation in current versions; robustness only). Remediation: stricter timeouts aligned with workers, magic-byte re-validation, strip control characters from filenames.

### SEC-025 · P3 · `force_password_reset` is advisory; installer ships known default password
Installer defaults to `password` (`app/Console/Commands/RelayInstallCommand.php:236-238`) with `force_password_reset=true`, but the app only shows a flash alert after login (`AuthenticatedSessionController.php:37-39`) — the user retains dashboard access and can ignore it; no route-level enforcement. Remediation: enforce a password-change redirect middleware until reset; require explicit admin password (or generate one) in the installer.

---

## 7. Multi-Tenancy Isolation Assessment

| Surface | In-repo scoping | Verdict |
|---|---|---|
| Requests index/show/update/delete (web) | `WorkRequestPolicy::view/update/...` use `belongsToWorkspace` | PASS while a workspace is active |
| Requests list/export/search/API index | `->when($activeWorkspace,…)`, `orWhereNull('workspace_id')` | **FAIL** for workspace-less accounts + NULL-workspace rows (SEC-004) |
| Comments | `authorize('comment')` + policy membership | PASS |
| Files upload/show/preview | `authorize('upload'/'view')` + `request_id` check | PASS (authz); content-disposition risk SEC-008 |
| Relations | none | **FAIL** (SEC-005) |
| Subtasks | policy on subtask + parent binding check | PASS |
| Clone | `view` + `create` policies | PASS |
| Cycles | none on rollover/store; index `when` | **FAIL** (SEC-006), list caveat SEC-004 |
| Areas (settings) | `manage_areas` only | **FAIL** cross-tenant (SEC-007) |
| Team/users | global role only | **FAIL** cross-tenant + escalation (SEC-001/003) |
| Saved views / notifications | `user_id`-scoped | PASS |
| Audit | `workspace_id` never written | **FAIL** (SEC-016) |
| Integrations/webhooks | global (no workspace column / cache) | **FAIL** (SEC-012/013/018) |
| Broadcast channels | membership predicate per channel (`routes/channels.php:7-25`) | PASS-by-construction; dormant (no broadcaster) |
| Workspace switch | membership/ownership check (`WorkspaceController::switch:20-25`) | PASS |
| Invitations | token+expiry on POST, signed GET, email-bound | PARTIAL (SEC-011) |

**Global role model is the structural root cause:** `users.role_id` is instance-wide; `workspace_user.role_id` is stored but unused for authorization, and team UI shows per-workspace members while the endpoint operates globally.

---

## 8. Permission Matrix (as implemented)

Roles present: **Owner, Developer, Designer** (no Admin/Member). Permissions seeded by `2026_10_18_000020_sync_core_permissions.php`.

| Capability (route) | Middleware gate | Controller/policy gate | Owner | Developer | Designer |
|---|---|---|---|---|---|
| View/submit requests | `auth`,`active` | `WorkRequestPolicy::viewAny/view` | ✔ | ✔ (all perms) | ✔ |
| Edit request | `auth`,`active` | `update` policy (Designer: requester-only) | ✔ | ✔ | requester-only |
| Change status / assign | `auth`,`active` (web FormRequest) | `changeStatus`/`assign` policy | ✔ | ✔ | changeStatus ✔; **assign ✖** |
| Delete request | `auth`,`active` | `delete` policy | ✔ | ✔ | ✔ |
| Upload files | `auth`,`active` | `upload` policy | ✔ | ✔ | ✔ |
| Comment / mention | `auth`,`active` | `comment` policy | ✔ | ✔ | ✔ |
| Export CSV/JSON | `auth`,`active` | **none** | ✔ | ✔ | ✔ |
| Settings / projects / team / integrations | `permission:manage_workspace` (global role) | `manage_areas`/`manage_team` globals | ✔ | ✔ | ✖ |
| Cycle rollover/create | `auth`,`active` | **none** | ✔ | ✔ | ✔ (any user) |
| Relations create/delete | `auth`,`active` | **none** | ✔ | ✔ | ✔ (any user) |
| API v1 mutations | `auth:sanctum` | `update` policy only (status/assign unchecked) | ✔ | ✔ | ✔ via API |
| PAT issuance | `auth`,`active` | none (abilities unenforced) | ✔ | ✔ | ✔ |

**Mismatches flagged:** Developer = effective admin (should never hold `manage_*`); web↔API asymmetry for status/assign (SEC-014); export/relations/cycles have no permission gate at all; UI gating (`canEdit`/`canAssign` props from policies) is **stricter than the API** and than several endpoints.

---

## 9. Real-Time / WebSocket Verification

Claims of live Reverb/Pusher real-time are **not backed by this build**:

- `php artisan about` → `Broadcasting: log`; no broadcaster packages in either lockfile; no `config/broadcasting.php`/`reverb.php`; `window.Echo` is never bootstrapped (`resources/js/bootstrap.ts`, `app.tsx` contain no Echo setup), so the private-channel listeners in `resources/js/Features/Requests/components/KanbanBoard.tsx:90-122` are dead code that "gracefully fall back".
- The only working live sync is `BroadcastChannel('relay_workspace_live_sync')` — same-browser cross-tab only.
- `routes/channels.php` defines `workspace.{id}` and `request.{id}` authorization callbacks with correct membership predicates, and `broadcasting/auth` exists (`route:list`) — so if a broadcaster is later enabled the channel boundary is designed correctly; however `WorkRequestCommented::broadcastWith` ships the full comment body and full request detail over the private channel (`app/Events/…:60-72`), and `WorkRequestMoved` ships the presenter card. Any future broadcaster must re-verify membership at subscribe time, payload minimization, and cross-tenant channel IDs.
- Payload exposure today: none (no Transport). Governance requirement: re-audit when Reverb is introduced; add broadcast tests (the repo's `ReverbRealtimeBroadcastTest.php` cannot currently exercise a real broadcaster).

---

## 10. Integration Security Summary

| Integration | Auth | Replay/idempotency | Tenant scope | Verdict |
|---|---|---|---|---|
| GitHub webhook in | HMAC-SHA256 raw-body, `hash_equals` — **fail-open if secret unset** | none (`X-GitHub-Delivery` ignored) | global, `REQ-<id>` only | **P1** SEC-009 |
| Inbound email | **none** | none | global, sender-workspace gate only | **P0** SEC-002 |
| Discord outbound/test | admin permission only | n/a | global cache URL | **P1** SEC-012 |
| Generic outgoing webhooks | HMAC when secret set | n/a | **global list, no workspace column** | **P1** SEC-013 |
| Email notifications | n/a (outbound) | `tries=3` retries | per-user, logs global | P2 SEC-022 |

---

## 11. Dependency & Supply-Chain Posture (versions only)

- `laravel/framework` v13.33.0 · `laravel/sanctum` v4.3.3 · `laravel/socialite` v5.31.0 · `pragmarx/google2fa` v9.1.0 · `inertiajs/inertia-laravel` ^3.0 · PHP 8.4.22 · React 19 / Vite 8 / TipTap 3.x.
- No `laravel/reverb`, no Pusher/Echo chain — real-time feature absent (above).
- `spatie/laravel-ignition` present as a **dev** dependency; Docker build installs `--no-dev` (verified `Dockerfile:19-26`), so production images lack it. Ensure production never runs with dev deps + `APP_DEBUG=true`.
- **CVE verification intentionally not performed here** (no `composer audit`/`npm audit` runs; Agent 4 owns dependency auditing per task split). No CVE claims are made in this report.

---

## 12. Governance, Deployment & Operations Notes

- **Audit trails:** see SEC-016 (unscoped, partial, mutable). Deletion semantics: deleting a user nulls audit attribution (`user_id nullOnDelete`); deleting a workspace cascades to requests/areas (`cascadeOnDelete`) → evidence destruction. Document retention/backup implications before enabling destructive admin flows.
- **Exports:** unrestricted by permission (SEC-004); no per-tenant export audit event.
- **Docker/compose:** default `DB_PASSWORD=secret`/`MYSQL_ROOT_PASSWORD=rootsecret`, Redis published on `:6379` **without a password by default**, Mailpit UI `:8025` published, `entrypoint.sh` auto-generates `APP_KEY` when missing (new key on redeploy invalidates sessions/encrypted columns if not persisted) and auto-runs `migrate --force`; container runs supervisord as root. All are deployment-hardening items (P2) for the Q/A & deployment agent; the app itself ships `--no-dev` vendor.
- **No trusted-proxy configuration** (`TrustProxies` untouched): client IPs for throttling/audit are spoofable if deployed behind a proxy until configured.

---

## 13. Verified Non-Findings (false-positive eliminations)

The following were actively traced and **not** vulnerable; reported here to prevent re-litigation:

1. **Markdown/comment stored XSS (descriptions and comments):** `MarkdownViewer.tsx` and `RequestDiscussionSection.tsx` render user content as escaped React text nodes only; the only `dangerouslySetInnerHTML` uses are framework pagination labels (`Components/Pagination.tsx`), the server-generated TOTP QR SVG (`TwoFactorSecurityCard.tsx:228`), and TipTap's `div.innerHTML` conversion on a detached node (inert DOM parse into ProseMirror). No executable sink found in these paths. (The real XSS is the file-serving path, SEC-008.)
2. **SQL injection:** all dynamic query construction found uses parameter binding (`where/like` with bound values; `selectRaw` in `DashboardService` uses placeholders); `orderByRaw` CASE expressions contain static literals only.
3. **Mass assignment:** writes use validated arrays or explicit attribute lists; `$fillable` excludes `password`/`two_factor_*` where they would be dangerous (`ProfileUpdateRequest` does not accept `role_id`).
4. **CSRF:** all browser mutations live in the `web` middleware group (`route:list` confirms); API route group is token-based. `InvitationAcceptController` is an intentional public form.
5. **Session fixation:** login regenerates the session (`AuthenticatedSessionController.php:33`); logout invalidates + regenerates CSRF token.
6. **Login user-enumeration:** failed attempts return a single generic message; throttling keyed by username+IP.
7. **GitHub HMAC when configured:** raw body + `hash_equals` (no timing leak).
8. **Channel authorization design:** membership predicates present; dormant until a broadcaster exists.

---

## 14. Pre-Production Blockers

Deployment is blocked until at minimum:

1. **SEC-001** — workspace-scope team mutations; no self role change; no password set via team endpoint.
2. **SEC-002** — authenticate inbound email webhook (fail-closed) or disable the route.
3. **SEC-003** — stop granting admin-grade “Developer” permissions on self-registration; least-privilege role.
4. **SEC-004** — fail closed when no active workspace (lists, exports, search, API).
5. **SEC-005/006/007** — add the missing authorization checks on relations, cycle rollover, areas.
6. **SEC-008** — force attachment/octet-stream for documents; add `nosniff`/CSP.
7. **SEC-009** — fail closed on missing GitHub secret; add delivery idempotency.
8. **SEC-010** — enforce 2FA at login (or remove the claim).
9. **SEC-012/013** — destination allow-list + per-workspace webhook scoping.
10. **SEC-019/025** — production env hardening (cookies, debug off, dev deps absent, installer password policy).

---

## 15. Prioritized Remediation Roadmap

**Phase 0 (days):** SEC-001, SEC-002, SEC-003, SEC-004 — cross-tenant/user-takeover chains.
**Phase 1:** SEC-005, SEC-006, SEC-007, SEC-008, SEC-009, SEC-010, SEC-011, SEC-014, SEC-015.
**Phase 2:** SEC-012, SEC-013, SEC-016, SEC-018, SEC-019, SEC-020, SEC-021.
**Phase 3:** SEC-017, SEC-022, SEC-023, SEC-024, SEC-025; then operational items in §12.

**Architectural fix with the highest leverage:** move authorization to the `workspace_user` pivot (per-workspace roles), delete the global-role shortcut in `User::hasPermission()`, and centralize a `BelongsToWorkspace` scoping primitive (route-binding scope + query scope) used by every controller/job; then add a security test matrix that runs every mutating route against a second workspace with an authenticated but non-member actor (negative tests), which is exactly what the existing suite lacks.
