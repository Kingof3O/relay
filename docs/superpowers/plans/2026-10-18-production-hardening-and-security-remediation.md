# Production Hardening & Security Remediation Plan (Relay Studio)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 30 security vulnerabilities, correctness bugs, architectural debt, documentation drift, and hygiene flaws identified across the code audits, elevating Relay Studio into a hardened, portable, enterprise-grade open-source project.

**Architecture:**
- Security: Token-guarded APIs (`auth:sanctum`), HMAC signature verification (`X-Hub-Signature-256`, `X-Relay-Signature`), rate limiting (`throttle`), hardened Nginx security headers (CSP, HSTS, X-Frame-Options), and dynamic secret key generation in Docker.
- Correctness & Portability: Database-agnostic ANSI SQL ordering (`CASE priority WHEN...`) ensuring seamless SQLite, PostgreSQL, and MySQL operation; transaction-safe email dispatches (`afterCommit`); genuine non-synthetic velocity metrics; and metadata-driven activity tracking.
- Architecture: Complete deletion of orphaned legacy models (`Idea`, `Task`, `FollowUp`, `Project`, `StoredFile`) and components; typed `RoleName` enums; enforced `permission` middleware; deduplicated presenters and popovers; and bounded `@mentions` queries.
- Features & Developer API: First-class `/api/v1/work-requests` REST API with Sanctum tokens; real server-side status rollback on Undo; team member email invitations; live timestamped workspace polling; and paginated audit logs.
- Hygiene & CI: Root cleanup (removal of internal master-prompt, moving screenshots to `docs/assets/`), updated `composer.json` (`relay/studio`, Apache-2.0), ESLint + Prettier configuration, Dependabot security scanning, and initial Git commit history.

**Tech Stack:** Laravel 13, React 19, TypeScript, Inertia v2, Sanctum, Tailwind CSS, Docker, Nginx, PHPStan, ESLint, Prettier, SQLite/MySQL/PostgreSQL.

**Spec:** Security, Portability, and Architecture Audit Reports (October 2026).

## Global Constraints
- Preserve the signature dark obsidian design tokens (`#07090e`, `#090a0f`, `#0c0d12`, `#121318`) with specular highlights and widescreen layout (`max-w-[1600px]`).
- Zero broken routes, permissions, or regressions in existing tests.
- 100% database portability: All SQL queries must work identically on SQLite, MySQL, and PostgreSQL.
- Zero TypeScript / Vite errors on `npm run build` and zero PHP syntax / type errors on `php artisan test`.

---

### Task 1: Security & Auth Hardening (Critical Holes, Webhooks & Docker Secrets)

**Files:**
- Modify: `routes/api.php`
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/GitHubWebhookController.php`
- Modify: `app/Jobs/DispatchOutgoingWebhook.php`
- Modify: `docker-compose.yml`
- Modify: `docker/entrypoint.sh`
- Modify: `docker/nginx.conf`
- Modify: `config/workspace.php`
- Modify: `app/Policies/WorkRequestPolicy.php`
- Modify: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
- Modify: `app/Http/Controllers/WorkRequestController.php`
- Test: `tests/Feature/SecurityHardeningTest.php`

**Interfaces:**
- Produces: Protected `/api/search` (requires auth), verified `X-Hub-Signature-256` webhook reception, signed `X-Relay-Signature` outgoing payloads, dynamic `APP_KEY` generation in container entrypoint, hardened Nginx headers.
- Consumes: `Hash::check()`, `hash_hmac('sha256', ...)`, `RateLimiter`

- [ ] **Step 1: Write failing security tests**
Create `tests/Feature/SecurityHardeningTest.php`:
- Test that unauthenticated `GET /api/search` returns 401 Unauthorized.
- Test that authenticated `GET /api/search` succeeds with search results.
- Test that `POST /api/webhooks/github` without valid HMAC signature returns 401/403.
- Test that `POST /api/webhooks/github` with valid `hash_hmac('sha256', $payload, $secret)` succeeds and moves ticket.
- Test that `WorkRequestPolicy::viewAny()` and `view()` deny unauthorized users and permit authorized users.
- Test that rate limiting throttles excessive login attempts.

- [ ] **Step 2: Run test to verify it fails**
Run: `php artisan test tests/Feature/SecurityHardeningTest.php`
Expected: FAIL.

- [ ] **Step 3: Secure `/api/search` & Add Rate Limiting**
- In `routes/api.php`: Wrap `/search` with `['auth:sanctum', 'throttle:60,1']` (or `web` session fallback for Inertia `auth`).
- In `routes/web.php`: Add `throttle:6,1` to `login` route.

- [ ] **Step 4: Implement Webhook HMAC Verification & Outgoing Signing**
- In `GitHubWebhookController.php`: Read `config('services.github.webhook_secret')` or `Webhook::where('name', 'github')->value('secret')`. Compute HMAC SHA256 of raw request payload against `X-Hub-Signature-256`. Return 401/403 if invalid.
- In `DispatchOutgoingWebhook.php`: Compute HMAC signature of outgoing JSON payload using webhook secret and attach header `X-Relay-Signature: sha256={hash}`.

- [ ] **Step 5: Harden Docker Secrets & Entrypoint**
- In `docker-compose.yml`:
  - Remove hardcoded `APP_KEY: "${APP_KEY:-base64:...}"` and replace with `APP_KEY: "${APP_KEY}"`.
  - Remove `command: --default-authentication-plugin=mysql_native_password`.
  - Replace hardcoded passwords with environment variables `${DB_PASSWORD:-secret}` and `${REDIS_PASSWORD:-}`.
  - Parameterize `APP_URL: "${APP_URL:-http://localhost:8080}"`.
- In `docker/entrypoint.sh`:
  - If `APP_KEY` is empty, check if stored in persistent storage or run `php artisan key:generate --show` dynamically.
- In `docker/nginx.conf`:
  - Add security headers:
    - `add_header X-Frame-Options "DENY" always;`
    - `add_header X-Content-Type-Options "nosniff" always;`
    - `add_header Referrer-Policy "strict-origin-when-cross-origin" always;`
    - `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`
  - Reconcile `client_max_body_size` with `config/workspace.php` (standardize to `64M`).

- [ ] **Step 6: Lock Down WorkRequest Policy & Authorization**
- In `WorkRequestPolicy.php`:
  - Update `viewAny(User $user)`: check `$user->hasPermission('view_requests')`.
  - Update `view(User $user, WorkRequest $request)`: check `$user->hasPermission('view_requests')` and ensure inactive users are rejected.
  - Update `changeStatus(User $user, WorkRequest $request)`: explicitly verify `$user->hasPermission('change_request_status')`.
- In `WorkRequestController.php`: Check `$this->authorize('changeStatus', $request)` when updating `status`.

- [ ] **Step 7: Run tests and verify**
Run: `php artisan test tests/Feature/SecurityHardeningTest.php`
Expected: PASS.

---

### Task 2: Database Portability & Correctness Bugs

**Files:**
- Modify: `app/Http/Controllers/WorkRequestController.php`
- Modify: `app/Http/Controllers/RequestCommentController.php`
- Modify: `app/Services/DashboardService.php`
- Modify: `database/migrations/2026_10_17_000001_add_performance_indexes_to_requests_and_activities.php`
- Test: `tests/Feature/DatabasePortabilityTest.php`

**Interfaces:**
- Produces: 100% ANSI SQL compatible ordering (`CASE priority WHEN ...`), transaction-safe comment notifications (`afterCommit`), genuine real-world velocity data.
- Consumes: Eloquent Builder, `DB::afterCommit()`.

- [ ] **Step 1: Write failing test for database portability and comment transactions**
Create `tests/Feature/DatabasePortabilityTest.php`:
- Test that querying `WorkRequestController::index()` succeeds on SQLite without `FIELD()` error.
- Test that failed/rolled-back comment creation does NOT send emails.
- Test that `DashboardService::velocity()` returns 0 instead of random numbers when no work is completed on a date.

- [ ] **Step 2: Replace `FIELD(priority, ...)` with Portable ANSI SQL**
In `WorkRequestController.php`:
Replace:
```php
->orderByRaw("FIELD(priority, 'urgent', 'normal', 'low')")
```
With portable ANSI SQL:
```php
->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END")
```

- [ ] **Step 3: Fix Comment Email Dispatch Transaction Safety**
In `RequestCommentController.php`:
Wrap email notification dispatch inside `DB::afterCommit(function () use (...) { SendRequestEmail::dispatch(...); });` so that if the transaction or database write fails, no erroneous emails are emitted.

- [ ] **Step 4: Remove Fake Random Data & Fix Activity Status Parsing in `DashboardService.php`**
- In `DashboardService.php`:
  - Lines 88-89: Replace `rand(2, 5)` and `rand(1, 4)` with actual `$created` and `$completed` counts (default `0`).
  - Lines 70-76: Replace fuzzy string search `where('body', 'like', '%done%')` with structured JSON metadata query or status transition check:
    ```php
    RequestActivity::query()
        ->where('type', 'status_changed')
        ->where(function ($q) {
            $q->whereJsonContains('metadata->to', 'done')
              ->orWhere('body', 'like', '%moved this to Done%');
        })
        ->where('created_at', '>=', now()->subDays(6)->startOfDay())
    ```

- [ ] **Step 5: Run tests and verify**
Run: `php artisan test tests/Feature/DatabasePortabilityTest.php`
Expected: PASS.

---

### Task 3: Architecture Cleanup, Dead Code Removal & Permissions

**Files:**
- Delete: `app/Models/Idea.php`, `app/Models/Task.php`, `app/Models/FollowUp.php`, `app/Models/Project.php`, `app/Models/StoredFile.php`
- Delete: `app/Enums/IdeaStatus.php`, `app/Enums/ProjectStatus.php`
- Delete: `app/Policies/IdeaPolicy.php`, `app/Policies/TaskPolicy.php`, `app/Policies/ProjectPolicy.php`, `app/Policies/RolePolicy.php`
- Delete: `database/seeders/BigDataSeeder.php`, `database/factories/IdeaFactory.php`, `database/factories/FollowUpFactory.php`
- Delete: `app/Presenters/WorkRequestPresenter.php` (consolidate into `App\Services\WorkRequestPresenter`)
- Delete: `resources/js/Components/Notifications/NotificationPopover.tsx` (redundant with `Features/Notifications`)
- Delete: `resources/js/Features/Dashboard/components/RecentAssignedIdeasCard.tsx`, `PendingReplyIdeasCard.tsx`, `OpenTasksCard.tsx`, `StatusCountsCard.tsx`
- Create: `app/Enums/RoleName.php`
- Modify: `app/Http/Controllers/TeamMemberController.php`
- Modify: `app/Http/Controllers/SettingsController.php`
- Modify: `app/Policies/WorkRequestPolicy.php`
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/RequestCommentController.php`
- Test: `tests/Feature/ArchitectureCleanupTest.php`

**Interfaces:**
- Produces: `RoleName` enum (`Owner`, `Developer`, `Designer`, `Stakeholder`), clean model namespace, strictly enforced permission middleware.
- Consumes: `App\Enums\RoleName`, `App\Http\Middleware\EnsureUserHasPermission`.

- [ ] **Step 1: Create `RoleName` Enum & Refactor Hardcoded Role Names**
Create `app/Enums/RoleName.php`:
```php
namespace App\Enums;

enum RoleName: string
{
    case Owner = 'Owner';
    case Developer = 'Developer';
    case Designer = 'Designer';
    case Stakeholder = 'Stakeholder';
}
```
Update `TeamMemberController.php`, `SettingsController.php`, and `WorkRequestPolicy.php` to reference `RoleName::Designer->value`, `RoleName::Owner->value`, etc.

- [ ] **Step 2: Delete Orphaned Legacy Skeleton Models & Components**
- Safely remove unused models `Idea.php`, `Task.php`, `FollowUp.php`, `Project.php`, `StoredFile.php`.
- Remove legacy factories and `BigDataSeeder.php`.
- Remove unused React components (`RecentAssignedIdeasCard.tsx`, `PendingReplyIdeasCard.tsx`, `OpenTasksCard.tsx`, `StatusCountsCard.tsx`).
- Remove duplicate `app/Presenters/WorkRequestPresenter.php` and redirect imports to `App\Services\WorkRequestPresenter`.
- Remove duplicate `resources/js/Components/Notifications/NotificationPopover.tsx`.

- [ ] **Step 3: Enforce `permission` Middleware on Sensitive Routes**
In `routes/web.php`:
Wrap settings routes with `permission:manage_workspace` or `permission:manage_projects`:
```php
Route::middleware(['permission:manage_workspace'])->group(function () {
    Route::post('/settings/projects', [AreaController::class, 'store'])->name('settings.projects.store');
    Route::patch('/settings/projects/{area}', [AreaController::class, 'update'])->name('settings.projects.update');
    Route::delete('/settings/projects/{area}', [AreaController::class, 'destroy'])->name('settings.projects.destroy');
    Route::post('/settings/team', [TeamMemberController::class, 'store'])->name('settings.team.store');
    Route::patch('/settings/team/{user}', [TeamMemberController::class, 'update'])->name('settings.team.update');
    Route::delete('/settings/team/{user}', [TeamMemberController::class, 'destroy'])->name('settings.team.destroy');
});
```

- [ ] **Step 4: Bound `@mentions` Query**
In `RequestCommentController.php`:
Constrain mention lookup:
```php
$mentionedUsers = User::query()
    ->where('active', true)
    ->whereIn('username', $matches[1])
    ->limit(10)
    ->get();
```

- [ ] **Step 5: Run full test suite to ensure zero regressions**
Run: `php artisan test`
Expected: PASS.

---

### Task 4: Real REST API v1 (`/api/v1/work-requests`) & Resilient Undo

**Files:**
- Create: `app/Http/Controllers/Api/V1/WorkRequestApiController.php`
- Create: `app/Http/Resources/WorkRequestResource.php`
- Modify: `routes/api.php`
- Modify: `resources/js/Features/Requests/hooks/useKanbanBoard.ts`
- Modify: `app/Http/Controllers/ExportController.php`
- Modify: `resources/js/Features/Settings/components/WorkspaceSnapshotCard.tsx`
- Modify: `app/Http/Controllers/SettingsController.php`
- Test: `tests/Feature/WorkRequestApiV1Test.php`

**Interfaces:**
- Produces: `GET /api/v1/work-requests`, `POST /api/v1/work-requests`, `GET /api/v1/work-requests/{id}`, `PATCH /api/v1/work-requests/{id}`, `DELETE /api/v1/work-requests/{id}`, true server-reverting Undo mechanism.
- Consumes: `auth:sanctum`, `WorkRequestResource`.

- [ ] **Step 1: Write failing tests for REST API v1**
Create `tests/Feature/WorkRequestApiV1Test.php`:
- Test token-authenticated `GET /api/v1/work-requests` returns paginated JSON resource.
- Test `POST /api/v1/work-requests` creates a ticket and returns 201.
- Test `GET /api/v1/work-requests/{id}` returns ticket detail.
- Test `PATCH /api/v1/work-requests/{id}` updates status/priority and returns updated resource.
- Test `DELETE /api/v1/work-requests/{id}` soft-deletes ticket.

- [ ] **Step 2: Create `WorkRequestResource` & `WorkRequestApiController`**
- Create `app/Http/Resources/WorkRequestResource.php` serializing ID, title, description, priority, status, due_date, tags, area, assignee, requester, timestamps.
- Create `app/Http/Controllers/Api/V1/WorkRequestApiController.php` implementing `index`, `store`, `show`, `update`, `destroy`.
- Register routes in `routes/api.php` under `prefix('v1')->middleware('auth:sanctum')`.

- [ ] **Step 3: Implement True Server-Reverting Undo in `useKanbanBoard.ts`**
In `resources/js/Features/Requests/hooks/useKanbanBoard.ts`:
- When status changes, capture previous status: `previousStatus = request.status`.
- In `notifyUndo`: when the user clicks "Undo", dispatch a real PATCH request to `/requests/{id}` reverting status back to `previousStatus`.
- If the initial status update request fails, display an error toast (`notifyError`) and reconcile `boardRequests` with server state rather than failing silently.

- [ ] **Step 4: Clean Streamed JSON Export in `ExportController.php`**
In `ExportController.php`: Ensure JSON export streams a clean, valid JSON array without invalid per-row pretty printing brackets.

- [ ] **Step 5: Run tests and verify**
Run: `php artisan test tests/Feature/WorkRequestApiV1Test.php`
Expected: PASS.

---

### Task 5: Team Invitations, Real-time Polling & Password Security

**Files:**
- Create: `database/migrations/2026_10_18_000006_add_force_password_reset_and_invite_token_to_users.php`
- Modify: `app/Models/User.php`
- Modify: `app/Http/Controllers/TeamMemberController.php`
- Modify: `app/Console/Commands/RelayInstallCommand.php`
- Create: `resources/js/Hooks/useWorkspaceLivePoll.ts`
- Modify: `resources/js/Features/Requests/components/KanbanBoard.tsx`
- Modify: `resources/js/Pages/Notifications/Index.tsx`
- Test: `tests/Feature/TeamInvitationAndSecurityTest.php`

**Interfaces:**
- Produces: `force_password_reset` flag, invitation token generation, live polling hook (`useWorkspaceLivePoll`) syncing board & inbox updates every 15s when active.
- Consumes: Inertia `router.reload({ only: ['requests', 'notifications'] })`.

- [ ] **Step 1: Migration for User Security & Invites**
Create migration adding `force_password_reset` (boolean default false) and `invite_token` (string nullable) to `users`.
Run migration: `php artisan migrate`.

- [ ] **Step 2: Team Member Invitation Flow & Forced Reset**
- In `TeamMemberController.php`: When adding a new member, generate an invite token, set a temporary secure random password, and flag `force_password_reset = true`.
- In `RelayInstallCommand.php`: When creating the initial admin with password, flag `force_password_reset = true` so the admin is prompted to set their own password on first session.

- [ ] **Step 3: Live Workspace Polling Hook**
Create `resources/js/Hooks/useWorkspaceLivePoll.ts`:
- Automatically triggers lightweight background reload (`router.reload({ only: ['requests', 'notifications'], preserveScroll: true, preserveState: true })`) every 15-20 seconds when the browser tab is focused and document is visible (`document.visibilityState === 'visible'`).
- Integrate into `KanbanBoard.tsx` and `Notifications/Index.tsx` so users working concurrently see live updates without manual page refreshes.

- [ ] **Step 4: Run tests and verify**
Run: `php artisan test tests/Feature/TeamInvitationAndSecurityTest.php`
Expected: PASS.

---

### Task 6: Hygiene, Tooling, CI & Initial Git Commit

**Files:**
- Modify: `.gitignore`
- Modify: `composer.json`
- Modify: `package.json`
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `CODE_OF_CONDUCT.md`
- Create: `.github/dependabot.yml`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md`
- Move: Root screenshots (`*.png`) -> `docs/assets/`
- Delete: Root `project` file

**Interfaces:**
- Produces: Pristine Git repository, ESLint + Prettier tooling, clean `composer.json` (`relay/studio`, Apache-2.0), updated badges (Laravel 13, React 19), initial Git commit.
- Consumes: Git, npm, Composer.

- [ ] **Step 1: Clean Up Repository Clutter**
- Move all 13 root screenshot PNGs (`c1-sidebar.png` ... `v3-ideas.png`) to `docs/assets/`.
- Remove the internal `project` file from repository root.
- Create `CODE_OF_CONDUCT.md` using the Contributor Covenant v2.1.

- [ ] **Step 2: Update `.gitignore`**
Add:
```gitignore
.DS_Store
.playwright-mcp/
database/database.sqlite
database/database.sqlite-journal
docs/superpowers/
*.log
```

- [ ] **Step 3: Update `composer.json` & `README.md`**
- In `composer.json`:
  - Change `"name": "relay/studio"`.
  - Change `"description": "Tactile, high-density engineering work tracking, real-time Kanban boards, and delivery analytics."`.
  - Change `"license": "Apache-2.0"`.
  - Remove unused dev packages: `"laravel/breeze"`, `"laravel/sail"`.
- In `README.md`:
  - Update badges to accurately reflect Laravel 13, React 19, PHP 8.3/8.4, and Apache 2.0.
  - Update documented API endpoints to match the newly implemented `/api/v1/work-requests` routes.

- [ ] **Step 4: Configure ESLint, Prettier & Dependabot**
- Create `.prettierrc` (`singleQuote: true`, `tabWidth: 4`, `trailingComma: "es5"`).
- Create `eslint.config.js` configuring TypeScript and React hooks linting.
- Add `"lint": "eslint resources/js"` to `package.json`.
- Create `.github/dependabot.yml` monitoring `composer`, `npm`, and `github-actions`.
- In `.github/workflows/ci.yml`: Add `npm run lint` and `php artisan test` steps.

- [ ] **Step 5: Full Verification & Initial Git Commit**
- Run `npm run build` (confirm 0 errors).
- Run `php artisan test` (confirm 100% pass across all test suites).
- Stage all files: `git add .`
- Create clean initial Git commit: `git commit -m "feat: complete Relay Studio enterprise platform with v1 API, hardened security, and Docker stack"`

---
