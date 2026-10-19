# Relay Studio — Backend Architecture & Feature Completeness Audit (Pre-Production)

- **Date:** 2026-10-19 (audit window: 2026-10-18/19)
- **Auditor:** Agent 1 — Backend Architecture & Feature Completeness (read-only audit)
- **Scope:** Laravel backend (`app/`, `routes/`, `database/migrations`, `config/`, select `tests/Feature` files read as evidence) — issue tracking (`WorkRequest`/REQ-nnn), cycles, REST API v1, webhooks, notifications, tenancy/permissions, queue jobs, scheduler.
- **Method:** Static source review. Packages verified from `composer.json` + `vendor/` listing + `composer.lock` (Python inventory scan). No tests were executed; no migrations run; no DB writes. Only file reads, grep, and one `php`/`python` inventory scan were used.
- **Stack verified:** laravel/framework v13.33.0 (composer.lock), PHP ^8.3, sanctum 4.3.3, socialite 5.31.0, pragmarx/google2fa 9.1 (+ bacon-qr-code), inertia-laravel v3, ziggy 2, league/flysystem, symfony/mailer. **NOT installed:** laravel/reverb is absent (no `vendor/laravel/reverb`, nothing in composer.lock), no pusher PHP SDK, no horizon/telescope, no spatie/laravel-permission, **no phpstan/phpstan or larastan in the package list** (confirmed by scanning `composer.lock` `packages` + `packages-dev`). `config/` has no `broadcasting.php` (framework default merged, driver from `BROADCAST_CONNECTION`, example value `log`).

## Limitations (what could NOT be verified)
1. Tests were read, not run — all test claims below are phrased "test asserts X".
2. No runtime verification: queue worker behavior, webhook deliveries, TOTP login flow, real broadcast packets, SQL generated for SQLite-vs-MySQL (`DB_CONNECTION=mysql` in phpunit.xml but no query log was run) are SUSPECTED, not CONFIRMED.
3. Broadcasting auth route registration is inferred from `bootstrap/app.php:17` (`channels:` wiring of `ApplicationBuilder`); actual `POST /broadcasting/auth` behavior was not exercised.
4. `phpstan.neon` cannot be treated as a runnable tool: `vendor/bin` contains no `phpstan` binary and no phpstan/larastan package entry exists in the locked package sets.

---

## Executive summary

The core domain layer (requests, relations, subtasks, activity log, optimistic locking, burndown engine, file pipeline, notifications, export) is well organized — thin controllers over services, FormRequests for the two heavy mutating paths, transactions around multi-row work, `afterCommit` queue dispatch with a regression test. However, the **multi-workspace tenancy retrofit is incomplete and partially cosmetic**, the **permission system is role-global with per-workspace role pivots stored but never consulted**, **automatic cycle rollover is entirely unscheduled**, and several mutating admin/tenant endpoints (cycle rollover, settings area update/destroy, relation create/delete) **lack authorization checks**. Two user-facing security-adjacent integrations (inbound email, GitHub webhook) skip HMAC signature control or gate it on optional config, and **TOTP 2FA is decorative** — it is never enforced during authentication and its recovery codes are unusable.

**Verdict for backend domain: NOT READY for production.** Fix P1 tenancy/authorization items and the scheduler before production traffic.

---

## Architecture assessment

- **Controller/service split is generally good.** Heavy paths use FormRequests + services (`WorkRequestController` → `WorkRequestService::create/update/bulkCreate`); `UpdateWorkRequestRequest::authorize()` does field-level capability gating (app/Http/Requests/WorkRequest/UpdateWorkRequestRequest.php:15-39) — one of the better patterns here.
- **Authorization is inconsistent.** Only 2 policies exist (`UserPolicy`, `WorkRequestPolicy`). Mutating endpoints with **no policy/permission check beyond middleware**: `CycleController::rollover/store`, `RequestRelationController::store/destroy`, `SettingsController` (authz via `permission:manage_workspace` for routes but `AreaController` re-implements `manage_areas` inline without workspace scoping), `RequestCloneController` (authorize ok). See BK-03, BK-05, BK-10.
- **Fat-controller fragments remain**: `RequestRelationController::destroy` manually re-binds route params (`mixed $request/$workRequest`, RequestRelationController.php:96-119) to work around a route-name/model-binding quirk; `RequestCloneController::store` does the same (RequestCloneController.php:13-18).
- **Transactions**: create/update/delete, rollover, relation store/destroy, clone are inside `DB::transaction` (WorkRequestService.php:24,76,246; CycleService.php:146; RequestRelationController.php:68; RequestCloneController.php:25). Good. Violations: `CycleController::store` (number max() + create not transactional), `WorkspaceController::store` (workspace + pivot + no default seed, not transactional), `AreaController::reorder` (N sequential updates, no transaction).
- **Queue dispatch** is transaction-aware: `SendRequestEmail`/`SendDiscordNotification`/`DispatchOutgoingWebhook` dispatched `->afterCommit()` (WorkRequestService.php:62,66,154,164,239) and asserted by TransactionSafetyAndTelemetryTest.php:37-77.
- **Events**: `WorkRequestCommented`/`WorkRequestMoved` implement `ShouldBroadcast` (PrivateChannel `workspace.{id}`, Events/*/32-37). There are **no listeners and no observers** — events' only consumer is broadcasting. Missing express dependency: no reverb/pusher package; `.env.example` sets `BROADCAST_CONNECTION=log`, so in a default deployment broadcasts are written to logs and realtime does nothing (ReverbRealtimeBroadcastTest only asserts units: channel names + dispatch, never real transport).
- **Validation**: FormRequests used for bulk/update/comments-login/integrations are strong, but `store` paths on API v1 use inline `$request->validate` (fine), while a number of mutating paths do their own inline validation cycles (`CycleController::store`, `SubtaskController`, `AreaController`, `WorkspaceController`) with **no workspace-scope validation**.
- **Duplication**: twin controllers don't exist, but 4 places re-implement the "resolve `request`/`workRequest` route param" hack (RequestRelationController.php:16-24, 96-119; RequestCloneController.php:13-18), and the repetition of `orWhereNull('workspace_id')` fallbacks across 7 call-sites is a symmetric tenancy gap (BK-09).
- **Http/Requests/Requests oddity**: no duplicate `Http/Requests/Requests/` directory actually exists; FormRequests are organized under `Http/Requests/{Auth,Integration,Role,User,WorkRequest}` — architecture cleanup test asserts this (ArchitectureCleanupTest).
- **Tooling**: `phpstan.neon` (344 bytes) references levels but phpstan is not installed in vendor (see limitations) — static analysis is declared config with no runner.

---

## Feature implementation matrix

| Feature | Status | Notes |
|---|---|---|
| Issue CRUD & REQ ids | PARTIAL | Single create only via `POST /requests/bulk` (1 row) or API v1 store; `WorkRequestService::delete` **forceDeletes**, API v1 **soft-deletes**; no restore route exists anywhere (`grep restore app/` → none) |
| Kanban server logic | VERIFIED | PATCH update, `WorkRequestMoved` broadcast, priority-ordered ordering; test asserts rollback flow (KanbanUndoAndPaginationTest.php:32-73) |
| List view server logic | PARTIAL | `limit` window cap 250/500 (WorkRequestController.php:38-41) but **no true pagination/cursor**; no `page` support for web index |
| Optimistic updates/locking (409) | VERIFIED | Controller pre-check + lockForUpdate + 409 (WorkRequestController.php:117-135; WorkRequestService.php:87-94); OptimisticLockingTest asserts 409 + rollback intact; only increments version on description change or explicit lock_version |
| Story points | VERIFIED | 0–100 validation (UpdateWorkRequestRequest.php:50), burndown weighting (CycleService.php:27-39) |
| Subtasks / hierarchy | PARTIAL | 1-level cap enforced in `SubtaskController::store` (:25-27); **bypassed via PATCH `parent_id`** (BK-04) |
| Dependencies + circular prevention | PARTIAL | Only direct reverse-edge check (RequestRelationController.php:50-66); transitive cycles possible |
| Auto-unblocking | VERIFIED | `resolveBlockedDependencies` on done + fresh dep deletion (WorkRequestService.php:309-353); test asserts unblock activity |
| Tags / priorities / due dates | VERIFIED | tags JSON cast, `due_date` scoped dueSoon/overdue, enum validation; WorkRequestAttributesTest asserts fields |
| Cycle management | PARTIAL | create/rollover exist; rollover racy idempotency handled (EdgeCasesAndRaceConditionsTest.php:254-274) but no authorization, no unique (workspace_id, number) |
| **Automatic rollover** | **MISSING** | No schedule anywhere: routes/console.php:6-8 only has default `inspire`; zero `Schedule`/`->schedule(`/`withoutOverlapping` matches in `app/` (grep) |
| Velocity | PARTIAL | completedPoints/daysElapsed (CycleService.php:113-115); includes completions dated before cycle start; auto-close-via-PR path records no "status_changed"/"approval" activity → excluded from dashboard velocity |
| Burndown | PARTIAL | Completion date = latest approval/status_changed→done or fallback updated_at (CycleService.php:53-69); approval after reopen still attributes the earlier approval date |
| Roadmap / Gantt data | VERIFIED | Quarter-bounded windows (RoadmapController.php:62-74), progress uses all-time totals; acceptable |
| Timezone handling | PARTIAL | All floors/compares use app TZ (default UTC) — `startOfDay()` in CycleService.php:42-53, `DATE(created_at)` in DashboardService.php:72,81; no per-user TZ |
| Command palette search backend | VERIFIED | GlobalSearchController scoped + REQ id parsing; workspace-scope asserted by EdgeCasesAndRaceConditionsTest.php:142+ |
| Server-side undo | VERIFIED | Client re-PATCHes previous status; asserted by KanbanUndoAndPaginationTest.php:32-73 |
| Markdown/comments server | PARTIAL | Comments stored as plain text (max 10000); no server-side markdown rendering (league/commonmark installed but unused in app/) |
| Mentions | VERIFIED | Regex **bounded to 10 tokens**, active users only, excludes author (RequestCommentController.php:33-56); tests assert dispatch |
| Notifications | VERIFIED | DB notifications via `notifyRelevantUsers`, read/unread/toggle; NotificationTest asserts flows |
| File upload/conversion/preview | VERIFIED | Document/image/video pipeline w/ Imagick-or-GD→WebP + FFmpeg transcode + preview JPEG; mime/type allowlist (RequestFileService.php:34-68); stuck "processing" state possible (BK-16) |
| REST API v1 | PARTIAL | CRUD works, Sanctum-protected; **no throttle on v1** (throttle only `/search`), pagination capped 100, no workspace selector, `orWhereNull(workspace_id)` leak |
| Personal access tokens | PARTIAL | CRUD + expiry; abilities accepted but **`tokenCan` is never checked anywhere** (`grep tokenCan app/` → none) → '*' tokens meaningless as scoping |
| Inbound email | PARTIAL | Postmark/Mailgun/raw field normalization; sender+workspace verification (InboundEmailWebhookController.php:31-95); **no HMAC, no throttle** (BK-06) |
| GitHub sync | VERIFIED | HMAC only when secret configured (GitHubWebhookController.php:19-29); PR upsert idempotent by key (no DB unique tho — BK-25), merged→done with unblock |
| Slack/Discord notifications | VERIFIED | Per-user prefs filtering (SendRequestEmail.php:38-47), Discord embeds incl. test command; delivery log rows written |
| CSV/JSON export | VERIFIED | Streamed, workspace-scoped test EdgeCasesAndRaceConditionsTest.php "export strictly scoped" |
| **Workspace isolation (server surface)** | **PARTIAL** | 7 call-sites read `orWhereNull('workspace_id')` fallback; pivot roles unused; seeder creates districts w/o workspace or enrollment (BK-09, BK-01) |
| Invitations / roles | PARTIAL | Invite/accept flow VERIFIED (signed URLs on show; WorkspaceInvitationTest); roles are **global** rows not editable via any route; `manage_roles` permission is declared but enforced nowhere; `RoleService` class is dead code (grep: only definition) |
| Audit logging | PARTIAL | WorkspaceAudit covers settings/team/integrations; **no workspace audit for request CRUD**; RequestActivity granularity good for track field changes but subtask toggle & delete record nothing |
| TOTP 2FA + recovery | **BROKEN** | Enable/confirm/disable exist but **login never challenges 2FA**; recovery codes generated but never consumable; disable requires no TOTP code |
| Google/GitHub OAuth | PARTIAL | Login/callback/link/create works (SocialAuthService.php); **no workspace enrollment for new OAuth users**; account linking trusts provider email |
| Saved views | VERIFIED | store/pin/destroy with owner checks |
| Bulk actions | PARTIAL | bulk **create** only; no bulk edit/delete API; rows unbounded |

---

## Findings

### BK-01 — Per-workspace role pivots are stored but never consulted; permissions are global
- **Severity:** P1
- **Affected:** Workspaces, roles/permissions, settings
- **Status:** CONFIRMED
- **Files:** app/Models/User.php:144-172; app/Models/Workspace.php:29-34; database/migrations/2026_10_18_000011_create_workspaces_and_workspace_user_table.php:25-33; app/Http/Controllers/TeamMemberController.php:108-139
- **Observed:** `hasPermission()` reads only `$this->role_id` (global `users.role_id`); `workspace_user.role_id` is written (TeamMember stance, invitation accept, WorkspaceController::switch attach) but **never read** for any permission decision. `TeamMemberController::update` mutates the user's global `role_id`, which silently changes their role in **all** joined workspaces.
- **Expected:** permission checks for workspace-scoped surfaces should resolve the membership row's `workspace_user.role_id`.
- **Root cause:** tenancy retrofit stopped at storing membership roles.
- **Fix:** add a `roleForWorkspace(int $workspaceId): ?Role` resolver (pivot first, fallback global) and use it in `hasPermission()` when resolving per-workspace routes/queries; stop writing dead pivot data or wire it.
- **Effort:** Medium. **Test to add:** feature test asserting a user who is Owner in workspace A and joined Developer in workspace B gets manage_workspace only in A.

### BK-02 — Automatic cycle rollover (and periodic reset) is never scheduled
- **Severity:** P1
- **Affected:** Cycles
- **Status:** CONFIRMED
- **Files:** routes/console.php:6-8; grep for `Schedule|->schedule\(|withoutOverlapping|->cron\(` across `app/` returns 0 hits; bootstrap/app.php:12-31 (no `->withSchedule()` call)
- **Observed:** `relay:cycle-rollover` (app/Console/Commands/RolloverCycleCommand.php) and `relay:doctor` are CLI-only; only the framework default `inspire` hourly exists. If nobody sets an external cron per workspace/deployment, active cycles never close past `end_date`, the roadmap/board's "current cycle" drifts and burndown/velocity metrics freeze.
- **Expected:** `Schedule::command('relay:cycle-rollover')->dailyAt(...)` (with overlap protection) in `routes/console.php`.
- **Root cause:** scheduler wiring omitted; commands assume manual invocation.
- **Fix:** schedule `relay:cycle-rollover` daily (e.g., 02:00) + document cron in docker entrypoint; add `withoutOverlapping()`.
- **Effort:** Small. **Test to add:** schedule registration test like `test_schedule_contains_rollover`.

### BK-03 — `CycleController::rollover` (and `store`) mutate cycles with no authorization or workspace scoping
- **Severity:** P1
- **Affected:** Cycles
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/CycleController.php:125-130 (rollover), :93-123 (store), :44-55 (index auto-creates Cycle 1 as a GET side-effect); routes/web.php:60-66
- **Observed:** Route binding fetches any `Cycle` by id; `rollover()` calls the service with no `$this->authorize()` and no workspace-membership check — any active user can roll over any workspace's cycle (`Cycles "is_active" + create next + move tickets`). `store` computes `number` from `max()+1` without transaction/unique constraint, so two concurrent creates can duplicate numbers. The index GET may **create** Cycle 1 as a side effect of a read request.
- **Expected:** rollover limited to `manage_workspace` (or cycle owner workspace members with a dedicated permission); store inside a transaction with a unique index.
- **Fix:** add explicit authorize (policy or `hasPermission('manage_workspace')`), scope the model binding to the current workspace, make `number` generation transactional, add unique index (see BK-17).
- **Effort:** Small. **Test to add:** outsider cannot rollover/another workspace's cycle (403).

### BK-04 — Work request mutations accept cross-workspace/out-of-scope references (`area_id`, `cycle_id`, `parent_id`, `assignee_id`)
- **Severity:** P1
- **Affected:** Issue CRUD, subtasks, cycles
- **Status:** CONFIRMED
- **Files:** app/Http/Requests/WorkRequest/UpdateWorkRequestRequest.php:47-53; app/Http/Controllers/Api/V1/WorkRequestApiController.php:53-64; app/Http/Requests/WorkRequest/BulkWorkRequestRequest.php:42-44; app/Http/Controllers/SubtaskController.php:29-48
- **Observed:** all checks are global `exists`: a user with edit permission can (1) file a request into **another workspace's area**, (2) attach it to **another workspace's cycle**, (3) set `parent_id` to a request in another workspace — or to **itself** (`parent_id = id` passes `exists:requests,id`), creating a self-parent that the subtask cap was designed to prevent, (4) assign a user who has no membership in the workspace.
- **Expected:** all referenced IDs constrained to the target workspace membership (`whereIn('id', workspace->areas()->select('id'))`, etc.). Subtask service enforces nothing on PATCH update — hierarchy cap not rechecked there.
- **Root cause:** retrofit added workspace columns but validation has no workspace argument.
- **Fix:** extend FormRequests with workspace-scoped rules + self/descendant-hover check for `parent_id`, and an `exists` verification against the request's workspace (not requester-side).
- **Effort:** Medium. **Test to add:** PATCH parent_id cross-workspace and self are rejected; assigning cross-workspace user rejected.

### BK-05 — Relationship creation/removal lacks authorization checks
- **Severity:** P1
- **Affected:** Dependencies / relations
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/RequestRelationController.php:16-94 (store), :96-153 (destroy)
- **Observed:** no `$this->authorize()` at all — `store` chain only checks `manage_workspace` middleware implicit or via FormRequest alternative (none here). Any active user with only `view_requests` permission can attach/detach `blocks`, `relates_to`, `duplicate` relations on requests in **any workspace** where the target has `workspace_id = 1... 999` (cross-workspace REFERENCE check exists at :39-47 but only for `blocks`).
- **Expected:** authorize `update`/`assign` on the affected request (workflow change).
- **Fix:** add `$this->authorize('update', $target)` (+ `related` policy check) and enforce the workspace guard for all `type` values.
- **Effort:** Small. **Test to add:** user without edit permission cannot add/delete a relation; cross-workspace link for `relates_to` rejected.

### BK-06 — Inbound email webhook creates comments for any known sender with no signature or throttle
- **Severity:** P1
- **Affected:** Integrations / inbound email
- **Status:** CONFIRMED (behavioral)
- **Files:** app/Http/Controllers/InboundEmailWebhookController.php:15-124; routes/api.php:24-25 (no throttle group on webhooks)
- **Observed:** no HMAC validation (no Postmark/Mailgun signature verification), no shared secret, and no rate limiting. Payload matching only needs the `from` header to be a known active workspace member and recipient/subject to contain `REQ-<id>`; any party able to reach the route can post a comment as them, with notifications mailed out. Attribution is a trust problem: the "requires knowing the user's email" is not verification.
- **Expected:** verify Postmark (X-Postmark-Signature) or Mailgun HMAC (config-driven) and add `throttle: webhook` + secret gate.
- **Fix (backend behavior):** require a per-secret token in the route or env, `hash_equals` payload signature before creating activity; document provider secret setup.
- **Effort:** Small/Medium. **Test to add:** unsigned/tampered inbound payloads 401/422.
- **Cross-agent:** security agent (shared escalate, BK-06 also listed in their scope).

### BK-07 — TOTP 2FA is decorative: not enforced at login, recovery codes unusable, disable is unauthenticated-by-TOTP
- **Severity:** P1
- **Affected:** Auth, profile
- **Status:** CONFIRMED
- **Files:** app/Http/Requests/Auth/LoginRequest.php:43-78 (no TOTP challenge, no `two_factor_secret` consult), app/Http/Controllers/Auth/SocialAuthController.php:87-91 (OAuth login also skips 2FA), app/Http/Controllers/Auth/TwoFactorAuthController.php:44-71 (confirm), :73-89 (disable w/o code), :91-114 (recovery regenerate but no consume endpoint anywhere)
- **Observed:** a user with confirmed 2FA logs in with username+password only. Recovery codes are generated (8 per turn), shown, but there is no endpoint that consumes them as a second factor; `disable` clears 2FA without any code/password re-verification.
- **Expected:** enforce a TOTP step in `LoginRequest::authenticate()` (use endpoint or `two_factor_challenged` session), consume/redeem recovery codes, require current TOTP to disable.
- **Fix:** add 2FA state gate in the login attempt & Socialite callback, and add recovery-code redemption.
- **Effort:** Medium. **Test to add:** a confirmed-2FA user cannot login without valid code; disable requires code; recovery code single-use.

### BK-08 — GitHub webhook HMAC is optional and REQ auto-close is unscoped
- **Severity:** P1
- **Affected:** Integrations / GitHub sync
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/GitHubWebhookController.php:19-29, 58-129
- **Observed:** signature is verified only when `_either_` `services.github.webhook_secret` **or** a `webhooks` row named `github` contains a secret; otherwise the route accepts arbitrary JSON and can (1) auto-close any `REQ-nnn` to `done` (merged→done path), (2) insert `PullRequest` records with arbitrary `url`/`title`, (3) move tickets to review. Even with a valid signature, there is **no repository/workspace binding** — one secret at config-level opens every ticket id in the system. There's no throttle and no audit log.
- **Expected:** mandatory secret, repo allowlist→workspace mapping, recording in workspace audit.
- **Fix (backend behavior):** abort 503 in production if no secret is configured; add `github_repos` binding table; create workspace audit entries.
- **Effort:** Medium. **Test to add:** unverified (no secret) GitHub POST with keyword payload is rejected in testing `APP_ENV=production` simulated.

### BK-09 — Tenancy retrofit leaves a workspace-less data shadow that leaks cross-workspace
- **Severity:** P1
- **Affected:** Workspace isolation, all surfaced read paths
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/WorkRequestApiController.php:32; app/Http/Controllers/GlobalSearchController.php:34,59; app/Http/Controllers/ExportController.php:20; app/Http/Controllers/RoadmapController.php:31; app/Http/Controllers/SavedViewController.php:21; app/Http/Middleware/HandleInertiaRequests.php:105; database/migrations/2026_10_18_000011_create_workspaces_and_workspace_user_table.php:35-45 (nullable FKs, **no backfill**); database/seeders/IndependentWorkspaceSeeder.php:139-160 (creates areas with **no workspace_id** and users with **no workspace enrollment**)
- **Observed:** several read queries use `where(workspace_id=active)->orWhereNull('workspace_id')` — any workspace-null row is visible to users of every workspace. The seeder creates exactly such rows and un-enrolled users, and `WorkRequestService::create` stores `workspace_id = $actor->currentWorkspace()?->id` — for a user without a workspace this writes `NULL` (tenant-less tickets that then show everywhere).
- **Expected:** consistent `where workspace_id = active` with NULL rows hidden; or migrate/backfill to a distinguished "Maybe legacy" bucket that becomes invisible after all workspaces exist.
- **Fix:** (a) skip `orWhereNull` leg for workspaces that exist; (b) backfill the first owning workspace onto legacy rows during a one-time upgrade command; (c) fail fast (403) creating requests without a workspace.
- **Effort:** Medium. **Test to add:** test that a workspace-null request is never returned by `/requests` nor `/api/v1/work-requests` from a member of another workspace.

### BK-10 — `AreaController::update`/`destroy`/`reorder` don't scope to workspace; slug uniqueness is global
- **Severity:** P2
- **Affected:** Settings/projects
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/AreaController.php:45-72 (global `where('slug', $slug)` check line :57), :74-87 (reorder no transaction), :89-104 (destroy any area by id), app/Http/Controllers/AreaController.php:106-109 (checks `manage_areas` only — not membership), database/migrations/2026_08_18_000001_create_areas_table.php:14 (`$table->string('slug')->unique();` global)
- **Observed:** permissions checked at role level (`manage_areas`) with no workspace verification; slug conflict checks (`store` workspace-scoped at :23 but DB unique key is global) conflict with each other — cross-workspace duplicate names can 500 on `store`.
- **Expected:** verification restricted to `manage_areas` inside the workspace, and DB-level uniqueness per workspace.
- **Fix:** make `slug` unique per workspace (`unique(['workspace_id','slug'])`), add workspace membership abort, run reorder in a transaction.
- **Effort:** Small. **Test to add:** area-manager of workspace B cannot mutate workspace A's area (403).

### BK-11 — Settings leaks cross-workspace data on fallbacks
- **Severity:** P2
- **Affected:** Settings/audit/users
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/SettingsController.php:59 (`$auditEvents` = global `DISTINCT` over all workspaces), :93-97 (users list falls back to the entire user table when workspace has no members), :99 (roles)
- **Observed:** audit event names and full users table are shared beyond tenant boundaries on settings screen.
- **Fix:** scope all three to the active workspace (or workspace member set); per BK-01 these should use membership.
- **Effort:** Small.

### BK-12 — Delete semantics inconsistent: web hard-deletes and API soft-deletes; no restore path
- **Severity:** P2
- **Affected:** Issue CRUD, subtasks, UI data integrity
- **Status:** CONFIRMED
- **Files:** app/Services/WorkRequestService.php:242-253 (`forceDelete()` inside transaction), app/Http/Controllers/Api/V1/WorkRequestApiController.php:115-127 (`$workRequest->delete()` — soft delete; test asserts `assertSoftDeleted` in WorkRequestApiV1Test), routes/web.php:40-55 (no restore route), model has `SoftDeletes` (app/Models/WorkRequest.php:17), delete-parent cascades subtasks (database/migrations/2026_10_18_000015_add_parent_id_to_requests_table.php:17)
- **Observed:** DELETE via browser permanently erases the request (files also removed by service) and silently cascades subtasks; DELETE via API leaves recoverable rows; no UI/API route restores deleted items. README documents `DELETE /api/v1/work-requests` as soft-delete. Given BK-07 soft delete rows under `workspace_id` orphaning (parent gone), consistency data risk.
- **Fix:** pick one semantic (soft delete everywhere + restore route; or forceDelete everywhere), mirror UI+API, align README.
- **Effort:** Medium. **Test to add:** parity test — DELETE via web vs API yields same storage state; restore endpoint restores.

### BK-13 — Subtask status toggle bypasses the service layer (no activity, no notification, no dependency effect)
- **Severity:** P2
- **Affected:** Subtasks, activity, notifications
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/SubtaskController.php:60-81 (`$subtask->update(['status' => ...])` — no `WorkRequestService`), Contrast: WorkRequestService.php:110-129 records activity and notifies for status changes, and WorkRequestService.php:309-353 handles烈士 dependency auto-unblock only through `update()`
- **Observed:** toggling a subtask done neither records `status_changed` activity nor unblocks dependencies (important if subtask relations are `blocks`-typed to a subtask's id) nor triggers `resolveBlockedDependencies` semantics, nor runs Discord/email/DB-notification paths.
- **Fix:** route subtask status changes through `WorkRequestService::update` or reimplement the same side-effects.
- **Effort:** Small. **Test to add:** toggling a `blocks`-linked subtask done unblocks its dependents.

### BK-14 — Circular dependency prevention only detects direct reverse edges (no transitive DFS)
- **Severity:** P2
- **Affected:** Dependencies
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/RequestRelationController.php:50-66; test coverage is 1-hop only (EdgeCasesAndRaceConditionsTest.php:49-84)
- **Observed:** A blocks B, B blocks C, C blocks A → accepted; nullifies `is_blocked` semantics and can deadlock the auto-unblock chain (in practice completion is possible since status changes ignore `is_blocked`, but the GUI shows phantom blocked cards).
- **Fix:** iterative DFS via `blocking()`/`blockedBy()` pivots before insert; whitelist self-loop check also at `type=blocks` only.
- **Effort:** Small/Medium. **Test to add:** transitive cycle rejected.

### BK-15 — Request relation linking leaks data + destructive side actions
- **Severity:** P3
- **Affected:** Dependencies, audit
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/RequestRelationController.php:75-83 — attaching `blocks` silently sets `is_blocked=true` and rewrites `blocked_reason` with no permission audit; the destroy path at :126-141 clears flag with same behavior.
- **Observed:** `blocked_reason` is a freeform field that can be overwritten by rel/unrel operations with templated text.
- **Fix:** log a `request_relations.*` workspace audit; append reason rather than overwrite.

### BK-16 — Queue jobs: retries/misconfig gaps
- **Severity:** P2
- **Affected:** Queue jobs, file pipeline
- **Status:** CONFIRMED (code-verified against config/queue.php + job classes)
- **Files:** app/Jobs/DispatchOutgoingWebhook.php:16-138; app/Jobs/SendDiscordNotification.php:16-37; app/Jobs/SendRequestEmail.php:16-88; app/Jobs/ProcessRequestFile.php:16-35; config/queue.php:37-44 (`retry_after` 90s)
- **Observed:**
  1. `DispatchOutgoingWebhook` and `DiscordNotificationService::send` **catch-all-swallow** failures and never re-throw, enclosing `$tries=3` (Reuse) without backoff pointless — no retry ever occurs and 5xx from target is treated as success (`$client->post($url, $payload)` result ignored, no `->successful()` guard in DispatchOutgoingWebhook).
  2. `ProcessRequestFile` (`tries=1`) shells out FFmpeg with up to 3600s timeout (RequestFileProcessingService.php:185) while the DB queue `retry_after=90` → a restarted/overlapping worker can re-run the same job → duplicate transcoder processes/file paths (tokens are per-run so no corruption, but double CPU + double delivery notifications).
  3. No `backoff()`, no `uniqueFor`/`ShouldBeUnique`, no `failed()` handlers, no timeout properties anywhere (grep across app/Jobs).
- **Fix:** set `$timeout`, `$retryAfter`/`backoff`, remove swallow-catch in job classes or rethrow; make webhook job verify response status before counting success; align `retry_after` ≥ longest job runtime for process-heavy queues (dedicated queue for uploads).
- **Effort:** Medium. **Test to add:** force redis drive & assert retries honored; artifact stuck states cleared by retry.

### BK-17 — Cycle `number` uniqueness not enforced; store is not transactional
- **Severity:** P2
- **Affected:** Cycles
- **Status:** CONFIRMED
- **Files:** database/migrations/2026_10_18_000013_create_cycles_table.php:17-32 (no unique), app/Http/Controllers/CycleController.php:103-120
- **Observed:** `max('number')+1` may produce duplicates under concurrency; two cycles with same number in one workspace break UI labels and rollover's "existing next" dedupe (CycleService.php:151-159 returns the first match).
- **Fix:** add unique index `(workspace_id, number)` and wrap create in `DB::transaction`.

### BK-18 — Burndown/velocity math quirks
- **Severity:** P2
- **Affected:** Cycles metrics
- **Status:** CONFIRMED (static reading; formula edge cases)
- **Files:** app/Services/CycleService.php:22-45 (load and weights), :53-69 (completion-date attribution), :71-81 (ideal slope), :109-115 (velocity)
- **Observed:**
  1. `completedDates` includes completions dated **before** the cycle start — a request whose `status_changed→done` activity predates its current `cycle_id` assignment burns immediately on day 1 and inflates `velocity_points_per_day` (`completedPoints/daysElapsed` line :113-114).
  2. Completion detection prefers the *most recent* `approval` activity even when a later `status_changed` from done → reopened exists (CycleService.php:55-59) — reopened-then-reapproved-in-later-request attributions get the earlier date.
  3. Requests auto-closed by GitHub merged PR record ONLY `github_pr_merged` activity (GitHubWebhookController.php:93-103): not in `[approval,status_changed]`, so completion date falls back to `$request->updated_at` (approximate) and dashboard 7-day velocity (DashboardService.php:76-83 counts only type=status_changed with `metadata->to=done`) **excludes** those.
  4. `Compare` for `$endDate->lessThan($startDate)` then defaults +13 days (CycleService.php:44-46) silently fabricates a 14-day cycle for malformed data instead of clamping or erroring.
- **Fix:** predicate should consider only the latest matching `made-done` event (order filtered rows by id, pick where `to=done` latest); dashboard velocity should count the same source-of-truth event type; explicit validation on cycle datetimes.
- **Effort:** Medium. **Test to add:** burndown with previous-cycle completion + reopen — remaining line correct (currently misattributed); auto-closed-by-PR ticket counted in velocity.

### BK-19 — N+1 presenters: `loadCount('files')` per card and dashboard cards issue 40 count queries
- **Severity:** P2
- **Affected:** Performance / list view, Dashboard
- **Status:** CONFIRMED
- **Files:** app/Services/WorkRequestPresenter.php:178 (`loadCount('files')` inside card), called per row by WorkRequestController.php:52 map, CycleController.php:65 map, and WorkRequestService `bulkCreate` results; DashboardService cards() does 5 × 8 rows × `loadCount` query (DashboardService.php:167-182)
- **Observed:** indexes that return up to 250 cards trigger ~250 extra `select count(*) from request_files ...` queries per page render.
- **Fix:** eager load `files` count via `withCount('files')` on the base query or a single `GroupBy` count and hydrate.

### BK-20 — Bulk create endpoint is unbounded and chunk-dispatched per-row
- **Severity:** P3
- **Affected:** Issue creation, bulk actions
- **Status:** CONFIRMED
- **Files:** app/Http/Requests/WorkRequest/BulkWorkRequestRequest.php:23 (`'requests' => ['required','array','min:1']` — no `max`), app/Services/WorkRequestService.php:260-307
- **Observed:** one request can create unbounded rows; each row in its own transaction with per-row `Validator::make`; large payloads + notifications for every row (email+Discord) can flood queue.
- **Fix:** cap rows (e.g. 25/100) and reply with a partial payload; consider one transaction with savepoints per row + row cap.

### BK-21 — Synchronous invitation mail in an HTTP request
- **Severity:** P3
- **Affected:** Invitations
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/TeamMemberController.php:62 (`Mail::to($invitation->email)->send(...)` — dispatch through sync mailer not queued)
- **Observed:** SMTP unavailability turns `POST /settings/team/invite` into a 500 with no audit trail persisted (log happens after send).
- **Fix:** queue the Mailable (`ShouldQueue` on the Mailable or `Mail::to(...)->queue(...)`).

### BK-22 — Workspace creation not transactional and seeds no defaults
- **Severity:** P2
- **Affected:** Workspaces bootstrap
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/WorkspaceController.php:49-89
- **Observed:** `Workspace::create` + optional pivot attach are not inside a transaction; no default Area, Cycle, role bootstrap (if `roles` empty — the `Role::where('name','Owner')` fallback fails — the created workspace has **no membership rows** for its own owner).
- **Fix:** wrap in a transaction; require or seed default Area/Cycle; attach owner pivot unconditionally (create `Owner` role if missing).
- **Test to add:** fresh workspace yields at least 1 area/cycle and owner pivot row.

### BK-23 — API v1 cannot select a workspace; tokens bind to `currentWorkspace()` session/fallback
- **Severity:** P2
- **Affected:** REST API v1, workspaces
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/Api/V1/WorkRequestApiController.php:24-32 (uses `$user->currentWorkspace()`), app/Models/User.php:96-109 (session token flow: `session('active_workspace_id')` — undefined for API-only token sessions → falls back to `workspaces()->first()`)
- **Observed:** API consumers cannot pass a `workspace_id` parameter; all API operations address the user's first workspace; driven operations like `/api/v1/work-requests` (filters) can never read other workspaces the user belongs to even with `view_permissions`.
- **Fix:** add `workspace_id` filter to v1 endpoints, verify membership via `belongsToWorkspace`, honoring PAT bindings when configured.
- **Test to confirm:** PersonalAccessTokenTest asserts "test_generated_token_can_authenticate_api_requests" (currently happy path only).

### BK-24 — Optimistic locking only ratchets under explicit conditions; non-lock_version patch path is nave update
- **Severity:** P3 (actively mitigated by client behavior)
- **Affected:** Issue editing concurrency
- **Status:** CONFIRMED
- **Files:** app/Services/WorkRequestService.php:83-105
- **Observed:** lock_version increments **only** if the current request sends `lock_version` OR when the description is edited. A non-descriptor concurrent write (e.g., two agents assigning different assignees, turning blocked) doesn't bump the version — a stale client can later patch other fields silently clobbering (frontたらends are expected to always send `lock_version`, but nothing on the server enforces that for PATCHes missing it).
- **Fix:** increment version on every change-set; or use SQL CAS `UPDATE ... WHERE lock_version = ?` whenever provided. Note: `Test` asserts patchJson accepting both conditions, not a full-loss regression.
- **Effort:** Small/Medium.

### BK-25 — `pull_requests` has no unique constraint (only a non-unique composite index)
- **Severity:** P3
- **Affected:** GitHub sync
- **Status:** CONFIRMED
- **Files:** database/migrations/2026_10_18_000019_create_pull_requests_table.php:26
- **Observed:** `updateOrCreate` in GitHubWebhookController.php:69-82 races under webhook redelivery (GitHub delivers at least-once) without unique key — duplicated PR rows possible.
- **Fix:** add `unique(['work_request_id','provider','pr_number'])`.

### BK-26 — `relay:install` owner flow + OAuth-toggling config drift is cache-driven only
- **Severity:** P3
- **Affected:** Ops + admin toggles
- **Status:** CONFIRMED
- **Files:** app/Services/SocialAuthService.php:48-53 (`Cache::forever`), app/Services/DiscordNotificationService.php:98-119, app/Services/EmailNotificationService.php:82-103 (same pattern), cache store default `database` (config/cache.php:16 + .env.example)
- **Observed:** `cache:clear` silently resets OAuth/provider enablement, Discord & email integration settings — admins discover toggles off without any warning or audit log; these overrides are also invisible to `relay:doctor` unless it checks the same keys.
- **Fix:** persist in a settings table (per workspace!) or env file override with audit entry; that model is consistent with the workspace breadth.
- **Severity:** also note that none of these integration configs are per-workspace (P2 overlap with BK-09 family).

### BK-27 — ARR `notifyRelevantUsers` dispatches URLs generated in queue context (`route('requests.show', ...)`)
- **Severity:** P3 (ops config requirement)
- **Affected:** email notifications / webhook payloads
- **Status:** CONFIRMED (routing contract; not runtime exercise)
- **Files:** app/Services/WorkRequestService.php:225-231; app/Jobs/* handled dispatcher URL generation
- **Observed:** payload URLs built from `route()` at job-handled time; requires `APP_URL` set to a public host, otherwise notifications link to localhost. `.env.example` sets it where BROADCAST log default, but nothing validates in doctor command… (RelayDoctorCommand does check but is manual).
- **Fix:** capture URL at dispatch time (payload migration) or validate `APP_URL` in doctor.

### BK-28 — Vestigial 'high' priority ordering + enum mismatch
- **Severity:** P3
- **Affected:** Orderings/embeds
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/WorkRequestController.php:48, app/Http/Controllers/CycleController.php:62 (`CASE priority WHEN 'urgent'... 'high' THEN 2 WHEN 'normal'...`), app/Services/DiscordNotificationService.php:175 (`$priority === 'high'` color branch) — app/Enums/RequestPriority.php has ONLY urgent|normal|low
- **Observed:** 'high' branch is unreachable; 'normal' and 'low' collapse to positions 3 and 4 — fine, just dead branch. No data loss.
- **Fix:** scrub or re-add `High` to the enum consistently (choose one).

### BK-29 — `requests` store silently tolerates tenant-less workspace for users with no current workspace
- **Severity:** P2
- **Affected:** Issue CRUD / workspaces
- **Status:** CONFIRMED
- **Files:** app/Services/WorkRequestService.php:22-43, line 25 `$workspaceId = $attributes['workspace_id'] ?? $actor->currentWorkspace()?->id;`
- **Observed:** creates requests with `workspace_id=NULL` (tenant-less) for users without enrollment — combined with BK-09 those leak everywhere; should error rather than fall back to NULL.
- **Fix:** `abort_unless($workspaceId, 422, 'Create or join a workspace first.');`

### BK-30 — Session-based workspace switching, API fallback as above (BK-23), `switch` route does not route to specific workspace context for API
- **Severity:** P3
- **Affected:** Workspaces, SPA/API
- **Status:** CONFIRMED
- **Files:** app/Http/Controllers/WorkspaceController.php:16-47 (switch stores `session('active_workspace_id')`, no CSRF-announced), routes/web.php:35
- **Observed:** `previousUrl` sniffing (`str_contains('project=')`) is brittle; a stale session pointer to a workspace the user *was* removed from resolves to first membership (User.php:100-105 handles member deleted gracefully). UI pages not re-bundled after switch could show mixed data until navigate.
- **Fix:** token-chain URLs per session; explicit redirect host cleanliness.

### BK-31 — `phpstan.neon` present, analyzer not installed
- **Severity:** P3
- **Affected:** Tooling
- **Status:** CONFIRMED
- **Files:** phpstan.neon (present); composer.json (no phpstan require); lock package inventory scan returns no phpstan/larastan entries; `vendor/bin/` listing has no phpstan
- **Fix:** decide: pin `phpstan/phpstan-larastan` as dev dependency in composer, or remove config to avoid false claims of static analysis.

---

## Confirmed bugs table (headline set)

| ID | Reproduction (static) | Effect |
|---|---|---|
| BK-01 | Workspace membership rows exist (`workspace_user.role_id`) but `hasPermission` never reads it (User.php:144) | Permissions identical across all joined workspaces |
| BK-03 | `POST /cycles/{cycle}/rollover` with any cycle id from any active session | Cross-workspace cycle closure + ticket moves |
| BK-04 | `PATCH /requests/{id}` with `"parent_id": <same id>` or another workspace request id / `"cycle_id": <other workspace's cycle>` | Self-parent / cross-workspace chain |
| BK-05 | `POST /requests/{request}/relations` with `type=relates_to` cross workspace (no workspace guard for type) + no authorize | Cross-workspace relation creation |
| BK-09 | Any endpoint `orWhereNull('workspace_id')` with NULL row in DB (seeder produces these) | Cross-workspace leakage |
| BK-12 | DELETE /requests/{id} (web) → row gone permanently; DELETE /api/v1/work-requests/{id} → recoverable | Inconsistent audit + data strategy |
| BK-22 | `POST /workspaces` in fresh DB (roles empty) | Workspace w/o membership pivot for owner |

---

## Database risks summary

1. **Tenancy retrofit NULLs**: `requests.workspace_id`/`areas.workspace_id` nullable FKs added in the late migration (2026_10_18_000011:35-45) — with no backfill/no NOT NULL enforcement. Tenantless rows permanently leak through `orWhereNull` paths (BK-09).
2. **Global uniques that should be workspace-scoped**: `areas.slug` unique global (2026_08_18_000001:14 vs AreaController.php:23 workspace-scoped check) → cross-workspace names can 500 on insert or false-positive duplicates in `update`.
3. **Missing unique**: `cycles (workspace_id, number)` absent (cycles migration :17-32) despite number-generation business logic (BK-17); `pull_requests (work_request_id, provider, pr_number)` absent (BK-25).
4. **Invitation tokens fine**: `token` unique (2026_10_18_000012:21); no invite-uniqueness per (workspace, email) → old rows reused-deleted at TeamMemberController.php:48-51, race can double-create (no unique); low impact.
5. **Indexes mostly good**: perf indexes for dashboard/board (2026_10_17_000001), payload pivots indexed; `workspace_audits.workspace_id` has **no index** (audit-side filters by workspace id on moderation screens) — minor.
6. **Request relations**: pivot `unique([request_id, related_id, type])` ✓ (2026_10_18_000002:18) — same row duplicates prevented; `parent_id` cascadeOnDelete causes silent subtask cascading (BK-12), consider `restrictOnDelete` + explicit UI handling.
7. `requests.parent_id` self-referential FK but **no DB-level loop prevention** — must be app-enforced (currently isn't, BK-04).
8. **JSON columns** (`tags`, metadata, notification prefs) rely on `JSON_CONTAINS`-like paths: `where('metadata->to','done')` (DashboardService.php:80) — supported MySQL 5.7+/SQLite (json_extract); fine but not portable to Postgres JSONB without driver-aware casting — tests only run MySQL ok.
9. Database portability: `DatabasePortabilityTest` only greps for FIELD() and orders by ANSI CASE (tests/Feature/DatabasePortabilityTest.php:24-110). `DATE(created_at)` (DashboardService.php:72,81) ISANSI portable enough (mysql/sqlite); `COUNT(CASE WHEN is_blocked = 1 ...)` (DashboardService.php:35) works for both drivers. Nothing blocking.
10. Timezone: `'DATE(created_at)'` buckets use DB server timezone; app timezone config default `UTC` (.env.example APP_TIMEZONE=UTC) → 7-day velocity window misaligned for non-UTC deployments; fix by casting to app TZ.

---

## API gaps summary

- Auth: `auth:sanctum` on all `/api/v1/*` (routes/api.php:14-22); `throttle:60,1` only on `/api/search` (routes/api.php:10-12) — v1 has **no rate limiting**.
- `/api/search` is unversioned but README tables it under "REST API v1 Endpoints" (README "REST API v1 Endpoints" section) — doc-route mismatch (minor).
- PATCH vs PUT: v1 uses PATCH (routes/api.php:17-18) matching README ✓; web PATCH for update too ✓.
- Abilities not enforced anywhere (`tokenCan` grep = 0 uses) — token `abilities` are theater (PersonalAccessTokenController.php:34 default `['*']`).
- No workspace parameter (BK-23) — one token = one workspace resolution; cross-workspace API use impossible without re-auth.
- 404 handling: `findOrFail` yields 404 with default Laravel JSON — no unified API error envelope (web exceptions render Inertia Error page — bootstrap/app.php:32-49 covers 500/503/404/403 — for API `wantsJson` check falls through to Laravel default? `respond` closure renders `inertia(...)` regardless of method, breaking API JSON error shape consistency). API error shape inconsistency is a P3.
- Pagination: only the work-requests index paginates (max 100/page, WorkRequestApiController.php:39); the projects endpoint returns all; `/api/search` caps at 8+4 items; no cursor strategy for big exports via API.
- No API for: cycle create/rollover, saved views, bulk ops, comments, files, undele.

---

## Production blockers (backend domain only)

1. **BK-09 / BK-22 / BK-29** — Tenancy: workspace-less rows leak; new workspaces may lack basics; users without workspaces can create tenantless tickets. Fix fold: backfill + guard + seeder.
2. **BK-03 / BK-05 / BK-10** — Missing authorization on cycle rollover, relation create/delete, settings areas — single-user-burn risk on every workspace in existence.
3. **BK-02** — No scheduler: rollover never fires autonomously; cron/entrypoint addition required by QA (cross agent).
4. **BK-16** — Queue retry semantics / silent failure of webhooks + ffmpeg race; must be corrected before production queue configured.
5. **BK-06 / BK-08** — Webhook-to-webhook rows include unsigned inbound write access (attack surface) — security agent owns the exploit side, but the backend must at minimum make signatures mandatory in production.
6. **BK-07** — 2FA login enforcement decision (ship without enforcing = remove the "Security" claim from docs).
7. **BK-04** — cross-workspace references in PATCH & bulk and PATCH update (parent_id self-loop) produce corrupted data (front-code guard currently avoids?), must be validation-locked before launch.

---

## Consolidated priority table

| Priority | Count | Items |
|---|---|---|
| P0 | 0 | — |
| P1 | 8 | BK-01, BK-02, BK-03, BK-04, BK-05, BK-06, BK-07, BK-08, BK-09 |
| P2 | 11 | BK-10, BK-11, BK-12, BK-13, BK-14, BK-16, BK-17, BK-18, BK-19, BK-22, BK-23, BK-25, BK-29 |
| P3 | 7 | BK-15, BK-20, BK-21, BK-24, BK-26, BK-27, BK-28, BK-30, BK-31 |

**Total explicit findings: 31** (some double-counted cases serve as cross-links to cross-cutting issues). No P0 exploitation reference in backend behaviors — attack sides are issues the security agent owns; the backend must not skimp on BK-06/BK-08 signature gating decisions before launch.

---

## Cross-agent notes

- **Security agent (03?):** the highest-value items to look for in detail:
  1. `SocialAuthController::callback` links OAuth identity by **email** without checking whether the provider account has been verified and without requiring password re-entry (SocialAuthController.php:49-53) — pre-account-takeover vector for newly enrolled accounts or providers with unverified emails.
  2. OAuth-created users get **no workspace enrollment** and default Developer role — check flow of currentWorkspace==null warnings (also frontend).
  3. PATs — no scope validation or '*' check — validate `tokenCan` never called (app/Http/Controllers/Api/V1/*). Session fixation on `2FA` enable/disable — no re-selling reconfirmation.
  4. `InvitationAcceptController::store` doesn't re-check `hasValidSignature` that show() enforces (InvitationAcceptController.php:42-90) — token-only path (token is 40 chars / unique — mitigate).
  5. `RequestFileController::show`/`preview` fetch from raw Storage disk — safe, but confirm `Content-Type`和她 ONLY allows file types; check stored content validation (text/html is blocked via type filter, but `document` includes `text/xml` / `application/msword` — is inline rendering of XML as `application/xml` a risk? Non-JS modern browsers won't run XML; but `text/plain`+XML spoofable? We assessed risk low).
  6. `IntegrationController::testDiscord` pings to **arbitrary** caller-provided URL (IntegrationController.php:97-103) — SSRF within `manage_workspace` role.
  7. Broadcast channel auth: `workspace.{id}` authorizes any user with membership and `request.{id}` authorizes any workspace member of the request's workspace — request lock/liveness authentication is sound; but confirm `broadcasting/auth` gets auth middleware via framework wiring bootstrap/app.php:17.
  8. GitHub webhook URL field is stored in DB unprefiltered; check CSP/CSS console rendering — frontend agent.
- **Frontend agent:** presenter payloads for lists carry nested `project`, `assignee` etc. — mind the fallbackNull `rollup` when workspace fields absent; high/complete 'high' priority branch irrelevant (Front-end uses only urgent/normal/low presumably).
- **QA agent:**
  1. Scheduler absence (BK-02) — needs cron/entrypoint; `docker/entrypoint.sh` currently doesn't run queues/schedulers? Verify.
  2. phpstan.neon is dead config until package installed (BK-31) — either install or program removal before CI claims.
  3. Migrations: database seeding depends on IndependentWorkspaceSeeder which creates tenantless areas (BK-09) — testing & production startup output inconsistent with workspaces; consider migration-time seeder deprecation.
  4. `RelayDoctorCommand` — run as part of CI to ensure it does not write state (it reads only) but verify.
  5. Mixed test base traits (RefreshDatabase vs DatabaseTransactions) in `tests/Feature/*` — may cause parallel flakiness under MySQL (phpunit.xml DB_CONNECTION=mysql DB_DATABASE=stm_testing; REA note: both traits are present in the suite: Transactions in Optimistic/Reverb/EdgeCase Tests; Refresh in Portability/Subtasks etc.)
  6. Queue: `QUEUE_CONNECTION=sync` in phpunit tests; verify docker entrypoint runs `php artisan queue:work` and `php artisan schedule:work` (currently unknown — QA), given BK-02.
