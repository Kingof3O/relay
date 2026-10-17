# Relay Studio Enterprise Linear Master Plan (All-Inclusive)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Relay Studio from an MVP into a complete, hardened, production-grade enterprise issue tracking platform matching Linear and Plane. This plan incorporates **every single item** from the three audit and roadmap reports: eliminating all 30 security, correctness, and hygiene defects while delivering multi-tenancy, Cycles/Sprints, Story Points, Hierarchical Sub-tasks, Custom Saved Views, Gantt Roadmap, Reverb WebSockets, TipTap block editor, `⌘K` action triggers, Sanctum REST API + PATs, 2FA, Social Login, and bidirectional GitHub PR synchronization.

**Architecture:**
- **Security & Multi-Tenancy**: Tenant-isolated workspaces (`workspaces`, `workspace_user`), Sanctum PAT authentication, 2FA (TOTP), GitHub/Google OAuth, rate limiting, HMAC webhook signing (`X-Hub-Signature-256`, `X-Relay-Signature`), hardened Nginx headers (CSP, HSTS), and dynamic Docker secret generation.
- **Portability & Data Reliability**: 100% ANSI SQL ordering (`CASE priority WHEN ...`) for universal SQLite/Postgres/MySQL portability; transaction-safe email dispatches (`DB::afterCommit`); genuine non-synthetic velocity tracking; structured activity metadata; and optimistic locking (`version` column) for concurrent edit conflict prevention.
- **Linear Agile Engine**: 2-week Cycles with auto-rollover and burndown velocity; Fibonacci story points (`1, 2, 3, 5, 8, 13`) and T-Shirt sizing; hierarchical sub-tasks with parent progress completion rings (`3/5 done`); custom saved views with shareable URLs; and a quarterly visual Gantt Roadmap.
- **Real-Time Collaboration & Ergonomics**: Laravel Reverb WebSocket broadcasting for instant card moves and comments across tabs; live presence viewing avatars; TipTap rich-text block editor with slash commands (`/todo`, `/code`, `/image`); `⌘K` action palette execution; roaming DB preferences; and discoverable shortcuts (`?`).
- **Developer Platform & Inbound Sync**: Documented `/api/v1/work-requests` REST API; Profile PAT manager; inbound email-to-comment webhook parser; bidirectional GitHub Pull Request autolinking (review status and merge closure); and server-reverting Kanban Undo.
- **Hygiene & Open Source Turnkey**: 100% unified "Relay Studio" identity (`relay/studio`, Apache-2.0); cleaned repo root (screenshots moved to `docs/assets/`, master prompt deleted, `CODE_OF_CONDUCT.md`); ESLint + Prettier + PHPStan static analysis; complete controller test coverage; Dependabot; and initial pristine Git commit.

**Tech Stack:** Laravel 13, React 19, TypeScript, Inertia v2, Laravel Reverb, Sanctum, TipTap, Tailwind CSS, Docker, Nginx, PHPStan, ESLint, Prettier, SQLite/MySQL/PostgreSQL.

**Spec:** Synthesized Master Audit & Product Roadmap Specification (October 2026).

## Global Constraints
- Strictly maintain the signature dark obsidian design tokens (`#07090e`, `#090a0f`, `#0c0d12`, `#121318`) with specular highlights and widescreen layout (`max-w-[1600px]`).
- 100% database portability: All SQL queries must run seamlessly on SQLite, MySQL, and PostgreSQL.
- Zero broken routes, permissions, or regressions in existing tests.
- Zero TypeScript / Vite errors on `npm run build` and zero PHP syntax / type errors on `php artisan test`.

---

### Module A: Security, Auth & Operational Hardening (P0 Criticals)

### Task 1: API Authentication, Webhook HMAC Verification & Rate Limiting
**Files:**
- Modify: `routes/api.php`
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/GitHubWebhookController.php`
- Modify: `app/Jobs/DispatchOutgoingWebhook.php`
- Test: `tests/Feature/SecurityHardeningTest.php`

**Requirements:**
- Protect `GET /api/search` with `auth:sanctum` and session auth fallback, throttled to 60 req/min.
- Add `throttle:6,1` rate limiting to `POST /login` and `throttle:60,1` to `/api/webhooks/*`.
- Verify GitHub webhook `X-Hub-Signature-256` HMAC using `config('services.github.webhook_secret')` or webhook model secret. Reject unauthorized requests with 401.
- Sign outgoing webhooks with `X-Relay-Signature: sha256={hash}`.

- [ ] **Step 1: Write failing security tests**
- [ ] **Step 2: Authenticate `/api/search` and add route throttles**
- [ ] **Step 3: Implement GitHub HMAC validation and outgoing webhook signing**
- [ ] **Step 4: Run tests and verify**

### Task 2: Docker Secrets Hardening, Nginx Headers & File Limits
**Files:**
- Modify: `docker-compose.yml`
- Modify: `docker/entrypoint.sh`
- Modify: `docker/nginx.conf`
- Modify: `config/workspace.php`
- Modify: `app/Http/Requests/WorkRequest/UpdateWorkRequestRequest.php`

**Requirements:**
- Remove hardcoded default `APP_KEY` from `docker-compose.yml`. Make it purely `${APP_KEY}`.
- Update `docker/entrypoint.sh` to auto-generate `APP_KEY` on first boot if unconfigured.
- Remove deprecated `--default-authentication-plugin=mysql_native_password` from `docker-compose.yml`.
- Parameterize MySQL password `${DB_PASSWORD:-secret}`, Redis password, and `APP_URL: "${APP_URL:-http://localhost:8080}"`.
- Harden `docker/nginx.conf` with production headers:
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`.
- Reconcile file-size limits: set Nginx `client_max_body_size 64M;` and align `config/workspace.php` `max_file_size_kb => 65536` with FormRequest validation rules.

- [ ] **Step 1: Update `docker-compose.yml` and `docker/entrypoint.sh`**
- [ ] **Step 2: Add Nginx security headers and align file-size configs to 64MB**
- [ ] **Step 3: Validate Nginx configuration syntax and compose file**

### Task 3: Authorization Lockdown & Policy Gating
**Files:**
- Modify: `app/Policies/WorkRequestPolicy.php`
- Modify: `app/Http/Controllers/WorkRequestController.php`
- Test: `tests/Feature/AuthorizationLockdownTest.php`

**Requirements:**
- Update `WorkRequestPolicy::viewAny(User $user)`: gate on `$user->active && $user->hasPermission('view_requests')`.
- Update `WorkRequestPolicy::view(User $user, WorkRequest $request)`: gate on `$user->active && $user->hasPermission('view_requests')`.
- Add dedicated `change_status` policy check on drag-and-drop status changes in `WorkRequestController::update`.

- [ ] **Step 1: Write failing authorization test**
- [ ] **Step 2: Implement permission checks in `WorkRequestPolicy` and `WorkRequestController`**
- [ ] **Step 3: Run test to verify passes**

### Task 4: Two-Factor Authentication (2FA/TOTP) & Social Login (OAuth)
**Files:**
- Create: `database/migrations/2026_10_18_000010_add_two_factor_and_oauth_to_users_table.php`
- Modify: `app/Models/User.php`
- Create: `app/Http/Controllers/Auth/TwoFactorAuthController.php`
- Create: `app/Http/Controllers/Auth/SocialAuthController.php`
- Create: `resources/js/Pages/Auth/TwoFactorChallenge.tsx`
- Modify: `resources/js/Pages/Profile/Edit.tsx`
- Create: `resources/js/Features/Profile/components/TwoFactorSecurityCard.tsx`
- Modify: `resources/js/Pages/Auth/Login.tsx`
- Test: `tests/Feature/TwoFactorAndOAuthTest.php`

**Requirements:**
- Add `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `github_id`, and `google_id` to `users`.
- Implement TOTP 2FA setup in Profile Settings (generates QR code svg and recovery codes, confirms with 6-digit token).
- Implement 2FA challenge interception on login when enabled.
- Add GitHub and Google OAuth 1-click login buttons on `Login.tsx` via Laravel Socialite / OAuth controller.

- [ ] **Step 1: Write failing 2FA & OAuth tests**
- [ ] **Step 2: Run migration for 2FA and OAuth columns**
- [ ] **Step 3: Implement `TwoFactorAuthController` and profile setup UI**
- [ ] **Step 4: Implement Social Auth routes and buttons on Login screen**
- [ ] **Step 5: Run tests and verify**

---

### Module B: Engine Portability, Correctness & Architecture Cleanup

### Task 5: Universal ANSI SQL Ordering & Database Portability
**Files:**
- Modify: `app/Http/Controllers/WorkRequestController.php`
- Test: `tests/Feature/DatabasePortabilityTest.php`

**Requirements:**
- Replace MySQL-specific `->orderByRaw("FIELD(priority, 'urgent', 'normal', 'low')")` with portable ANSI SQL:
  `->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END")`.
- Ensure all queries work identically on SQLite (for quickstarts/tests) and MySQL/PostgreSQL in production.

- [ ] **Step 1: Write database portability test**
- [ ] **Step 2: Replace raw FIELD query with ANSI SQL CASE statement**
- [ ] **Step 3: Run test to verify**

### Task 6: Transaction Safety, Real Telemetry & Activity Parsing
**Files:**
- Modify: `app/Http/Controllers/RequestCommentController.php`
- Modify: `app/Services/DashboardService.php`
- Test: `tests/Feature/TransactionSafetyAndTelemetryTest.php`

**Requirements:**
- In `RequestCommentController.php`: Wrap email dispatches inside `DB::afterCommit(...)` so failed transactions never send phantom emails.
- In `DashboardService.php`: Remove synthetic `rand(2, 5)` and `rand(1, 4)` fallbacks. Return actual counts or genuine `0` metrics with empty states.
- In `DashboardService.php`: Replace fragile fuzzy text matching `where('body', 'like', '%done%')` with structured JSON metadata checks (`whereJsonContains('metadata->to', 'done')`).

- [ ] **Step 1: Write failing tests for afterCommit and genuine velocity telemetry**
- [ ] **Step 2: Wrap comment emails in `DB::afterCommit`**
- [ ] **Step 3: Refactor `DashboardService` velocity to real metrics and structured activity matching**
- [ ] **Step 4: Run tests and verify**

### Task 7: Dead Code Elimination & Presenter / Popover Deduplication
**Files:**
- Delete: `app/Models/Idea.php`, `app/Models/Task.php`, `app/Models/FollowUp.php`, `app/Models/Project.php`, `app/Models/StoredFile.php`
- Delete: `app/Enums/IdeaStatus.php`, `app/Enums/ProjectStatus.php`
- Delete: `app/Policies/IdeaPolicy.php`, `app/Policies/TaskPolicy.php`, `app/Policies/ProjectPolicy.php`, `app/Policies/RolePolicy.php`
- Delete: `database/seeders/BigDataSeeder.php`, `database/factories/IdeaFactory.php`, `database/factories/FollowUpFactory.php`
- Delete: `app/Presenters/WorkRequestPresenter.php` (consolidate into `App\Services\WorkRequestPresenter`)
- Delete: `resources/js/Components/Notifications/NotificationPopover.tsx`
- Delete: `resources/js/Features/Dashboard/components/RecentAssignedIdeasCard.tsx`, `PendingReplyIdeasCard.tsx`, `OpenTasksCard.tsx`, `StatusCountsCard.tsx`
- Create: `app/Enums/RoleName.php`
- Modify: `app/Http/Controllers/TeamMemberController.php`
- Modify: `app/Http/Controllers/SettingsController.php`
- Modify: `app/Policies/WorkRequestPolicy.php`
- Modify: `routes/web.php`
- Modify: `app/Http/Controllers/RequestCommentController.php`
- Modify: `app/Http/Controllers/WorkRequestController.php`

**Requirements:**
- Safely remove all 5 legacy orphaned models, enums, policies, factories, and dead dashboard cards.
- Remove redundant empty subclass `app/Presenters/WorkRequestPresenter.php` and standardize on `App\Services\WorkRequestPresenter`.
- Remove duplicate `NotificationPopover.tsx` in `Components/Notifications/`.
- Introduce typed `RoleName` enum (`Owner`, `Developer`, `Designer`, `Stakeholder`), replacing hardcoded string literals.
- Enforce `permission:manage_workspace` middleware on all settings routes in `routes/web.php`.
- Constrain `@mentions` regex parsing in `RequestCommentController` to active users by username only (limiting to 10 matches).
- In `WorkRequestController`: reuse shared Inertia `workspaceProjects` instead of double-querying `Area`.

- [ ] **Step 1: Create `RoleName` enum and update role references**
- [ ] **Step 2: Delete orphaned legacy models, policies, seeders, and unused UI cards**
- [ ] **Step 3: Remove duplicate presenter and duplicate NotificationPopover**
- [ ] **Step 4: Protect settings routes with `permission` middleware**
- [ ] **Step 5: Bound `@mentions` and optimize `WorkRequestController` queries**
- [ ] **Step 6: Run full test suite to confirm zero regressions**

---

### Module C: Multi-Tenancy & Workspace Isolation

### Task 8: Multi-Tenant Workspace Architecture & Context Switcher
**Files:**
- Create: `database/migrations/2026_10_18_000011_create_workspaces_and_workspace_user_table.php`
- Create: `app/Models/Workspace.php`
- Modify: `app/Models/User.php`
- Modify: `app/Models/WorkRequest.php`
- Modify: `app/Models/Area.php`
- Create: `app/Http/Controllers/WorkspaceController.php`
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`
- Modify: `resources/js/Components/Sidebar.tsx`
- Create: `resources/js/Components/WorkspaceSwitcher.tsx`
- Test: `tests/Feature/MultiTenancyWorkspaceTest.php`

**Requirements:**
- Create `workspaces` (`id`, `name`, `slug`, `owner_id`, `logo_url`, `timestamps`) and `workspace_user` pivot (`workspace_id`, `user_id`, `role_id`).
- Add `workspace_id` to `requests`, `areas`, `cycles`, and `workspace_audits` with automatic Eloquent global scope or query filter.
- Provide `WorkspaceSwitcher.tsx` in the sidebar allowing users to switch active workspace and create new workspaces.
- Share current workspace and user workspaces via `HandleInertiaRequests`.

- [ ] **Step 1: Write failing multi-tenancy tests**
- [ ] **Step 2: Create migration and `Workspace` model**
- [ ] **Step 3: Implement workspace switching controller and session context**
- [ ] **Step 4: Build `WorkspaceSwitcher.tsx` in the frontend sidebar**
- [ ] **Step 5: Run tests and verify**

### Task 9: Team Member Email Invitations & Forced Password Reset
**Files:**
- Create: `database/migrations/2026_10_18_000012_add_invitations_and_force_reset_to_users.php`
- Create: `app/Models/WorkspaceInvitation.php`
- Create: `app/Mail/WorkspaceInvitationMail.php`
- Modify: `app/Http/Controllers/TeamMemberController.php`
- Create: `app/Http/Controllers/InvitationAcceptController.php`
- Create: `resources/js/Pages/Auth/AcceptInvitation.tsx`
- Modify: `app/Console/Commands/RelayInstallCommand.php`
- Test: `tests/Feature/WorkspaceInvitationTest.php`

**Requirements:**
- Create `workspace_invitations` table (`id`, `workspace_id`, `email`, `role_id`, `token`, `expires_at`, `created_at`).
- In `TeamMemberController`: when adding member, dispatch `WorkspaceInvitationMail` containing signed 7-day acceptance link.
- In `InvitationAcceptController`: invitee accepts invitation, sets their own name/password, and joins the workspace.
- In `RelayInstallCommand`: flag `force_password_reset = true` on the created admin account, prompting a password update on first session.

- [ ] **Step 1: Write failing invitation and password reset tests**
- [ ] **Step 2: Create migration and `WorkspaceInvitation` model**
- [ ] **Step 3: Implement invitation email dispatch and acceptance page**
- [ ] **Step 4: Implement forced password reset check on initial admin login**
- [ ] **Step 5: Run tests and verify**

---

### Module D: Linear Agile Engine (Cycles, Points, Sub-Tasks, Views & Gantt)

### Task 10: 2-Week Cycles Engine with Burndown Velocity & Auto-Rollover
**Files:**
- Create: `database/migrations/2026_10_18_000013_create_cycles_table.php`
- Create: `app/Models/Cycle.php`
- Modify: `app/Models/WorkRequest.php`
- Create: `app/Services/CycleService.php`
- Create: `app/Console/Commands/RolloverCycleCommand.php`
- Create: `app/Http/Controllers/CycleController.php`
- Create: `resources/js/Pages/Cycles/Index.tsx`
- Create: `resources/js/Components/Cycles/CycleBurndownChart.tsx`
- Modify: `resources/js/Components/Sidebar.tsx`
- Test: `tests/Feature/CyclesEngineTest.php`

**Requirements:**
- Table `cycles`: `id`, `workspace_id`, `number`, `name`, `start_date`, `end_date`, `is_active`, `completed_at`, `timestamps`.
- Add `cycle_id` and `rolled_over_from_cycle_id` to `requests`.
- `CycleService`: Calculate burndown velocity ($\Delta$ points completed per day vs ideal burndown line).
- CLI command `php artisan relay:cycle-rollover`: Close expired cycle, create next cycle, roll over unfinished tickets with a rollover badge.
- Frontend `/cycles`: Display active cycle header, burndown velocity chart, and cycle ticket list. Add "Cycles" nav link in Sidebar.

- [ ] **Step 1: Write failing cycles & burndown tests**
- [ ] **Step 2: Create migration and `Cycle` model**
- [ ] **Step 3: Implement `CycleService` and auto-rollover command**
- [ ] **Step 4: Create `/cycles` view with burndown chart and sidebar navigation**
- [ ] **Step 5: Run tests and verify**

### Task 11: Fibonacci Story Points & T-Shirt Estimation
**Files:**
- Create: `database/migrations/2026_10_18_000014_add_story_points_to_requests_table.php`
- Modify: `app/Models/WorkRequest.php`
- Modify: `app/Services/WorkRequestPresenter.php`
- Modify: `resources/js/types/workspace.ts`
- Modify: `resources/js/Features/Requests/components/RequestCard.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestSidebarProperties.tsx`
- Test: `tests/Feature/StoryPointsTest.php`

**Requirements:**
- Add `story_points` (nullable unsignedSmallInteger) to `requests`.
- Support Fibonacci point scale (`1, 2, 3, 5, 8, 13`) and T-Shirt mapping (`XS=1, S=2, M=3, L=5, XL=8`).
- Display story points pill badge on `RequestCard.tsx` and provide point selector in `RequestSidebarProperties.tsx`.

- [ ] **Step 1: Write failing story points test**
- [ ] **Step 2: Run migration and update model/presenter**
- [ ] **Step 3: Add story points badge to Kanban card and sidebar properties**
- [ ] **Step 4: Run tests and verify**

### Task 12: Hierarchical Sub-Tasks & Parent Issue Decomposition
**Files:**
- Create: `database/migrations/2026_10_18_000015_add_parent_id_to_requests_table.php`
- Modify: `app/Models/WorkRequest.php`
- Modify: `app/Services/WorkRequestPresenter.php`
- Create: `app/Http/Controllers/SubtaskController.php`
- Create: `resources/js/Features/Requests/components/Detail/RequestSubtasksSection.tsx`
- Modify: `resources/js/Features/Requests/components/RequestCard.tsx`
- Modify: `resources/js/Pages/Requests/Show.tsx`
- Test: `tests/Feature/SubtasksHierarchyTest.php`

**Requirements:**
- Add `parent_id` (nullable foreignId to requests with cascade) to `requests`.
- Add `parent()` and `subtasks()` relations in `WorkRequest.php`.
- In `WorkRequestPresenter.php`: Include `subtasks_progress` (`total`, `completed`, `percentage`).
- In `RequestCard.tsx`: Display progress ring / indicator (e.g. `3/5 done`).
- In `RequestSubtasksSection.tsx`: Render interactive child checklist in ticket view with 1-click inline creation and checkbox completion.

- [ ] **Step 1: Write failing sub-task hierarchy tests**
- [ ] **Step 2: Run migration and configure parent/child relations**
- [ ] **Step 3: Build `RequestSubtasksSection.tsx` with inline creation and status toggles**
- [ ] **Step 4: Render progress indicator on Kanban card**
- [ ] **Step 5: Run tests and verify**

### Task 13: Custom Saved Views (Pinned to Sidebar)
**Files:**
- Create: `database/migrations/2026_10_18_000016_create_saved_views_table.php`
- Create: `app/Models/SavedView.php`
- Create: `app/Http/Controllers/SavedViewController.php`
- Modify: `resources/js/Components/Sidebar.tsx`
- Create: `resources/js/Components/Requests/SaveViewModal.tsx`
- Modify: `resources/js/Features/Requests/components/BoardFilterBar.tsx`
- Test: `tests/Feature/SavedViewsTest.php`

**Requirements:**
- Table `saved_views`: `id`, `workspace_id`, `user_id`, `name`, `icon`, `filters` (json), `group_by`, `is_pinned`, `timestamps`.
- Allow users to save any active filter combination (e.g. "Robin's High Priority Bugs") with an icon.
- Pin saved views to the Sidebar under "Custom Views" with unique shareable URLs.

- [ ] **Step 1: Write failing saved views tests**
- [ ] **Step 2: Create migration and `SavedView` model**
- [ ] **Step 3: Implement `SavedViewController` (store, destroy, reorder)**
- [ ] **Step 4: Add "Save View" action in `BoardFilterBar` and render pinned views in `Sidebar`**
- [ ] **Step 5: Run tests and verify**

### Task 14: Visual Roadmap / Timeline Gantt View
**Files:**
- Create: `resources/js/Pages/Roadmap/Index.tsx`
- Create: `resources/js/Components/Roadmap/GanttTimeline.tsx`
- Create: `app/Http/Controllers/RoadmapController.php`
- Modify: `resources/js/Components/Sidebar.tsx`
- Test: `tests/Feature/RoadmapViewTest.php`

**Requirements:**
- Create `/roadmap` route rendering a visual quarterly Gantt timeline mapping projects and work requests across calendar months.
- Render start and due dates as colored obsidian milestone bars with dependency arrows connecting blocking tickets.
- Add "Roadmap" link to Sidebar navigation.

- [ ] **Step 1: Write failing roadmap view test**
- [ ] **Step 2: Implement `RoadmapController` returning projects with dated tickets**
- [ ] **Step 3: Build `GanttTimeline.tsx` and integrate in `/roadmap`**
- [ ] **Step 4: Run tests and verify**

---

### Module E: Real-Time Engine, Ergonomics & Editor

### Task 15: Live WebSockets with Laravel Reverb & Presence Indicators
**Files:**
- Create: `app/Events/WorkRequestMoved.php`
- Create: `app/Events/WorkRequestCommented.php`
- Modify: `app/Services/WorkRequestService.php`
- Modify: `routes/channels.php`
- Create: `resources/js/echo.ts`
- Modify: `resources/js/Features/Requests/components/KanbanBoard.tsx`
- Create: `resources/js/Components/LivePresenceAvatars.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestHeroHeader.tsx`
- Test: `tests/Feature/ReverbRealtimeBroadcastTest.php`

**Requirements:**
- Configure Laravel Reverb broadcasting for `WorkRequestMoved` and `WorkRequestCommented`.
- When User A moves a ticket or posts a comment, broadcast on private channel `workspace.{id}`.
- In `KanbanBoard.tsx`: Listen to Echo events and update `boardRequests` in real-time across active browser sessions.
- In `LivePresenceAvatars.tsx`: Use Echo presence channel `request.{id}` to display glowing live avatar dots showing who is currently viewing the ticket.

- [ ] **Step 1: Write broadcast event test**
- [ ] **Step 2: Create broadcast events and dispatch in `WorkRequestService`**
- [ ] **Step 3: Configure client Echo listener in `KanbanBoard.tsx`**
- [ ] **Step 4: Build `LivePresenceAvatars.tsx` in ticket header**
- [ ] **Step 5: Run tests and verify**

### Task 16: Concurrent Edit Conflict Resolution (Optimistic Locking)
**Files:**
- Create: `database/migrations/2026_10_18_000017_add_lock_version_to_requests_table.php`
- Modify: `app/Models/WorkRequest.php`
- Modify: `app/Http/Controllers/WorkRequestController.php`
- Modify: `resources/js/Pages/Requests/Show.tsx`
- Test: `tests/Feature/OptimisticLockingTest.php`

**Requirements:**
- Add `lock_version` (unsignedInteger default 1) to `requests`.
- On description save: verify submitted `lock_version` matches current database value.
- If another developer updated the description in the meantime, return 409 Conflict with warning toast: "This request was modified by another teammate. Please review changes before overwriting."

- [ ] **Step 1: Write failing optimistic locking test**
- [ ] **Step 2: Add `lock_version` column and check in `WorkRequestController::update`**
- [ ] **Step 3: Surface conflict resolution modal in ticket show view**
- [ ] **Step 4: Run tests and verify**

### Task 17: TipTap Rich-Text Block Editor with Slash Commands
**Files:**
- Create: `resources/js/Components/Editor/TipTapEditor.tsx`
- Create: `resources/js/Components/Editor/SlashCommandMenu.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestDescriptionCard.tsx`
- Modify: `package.json`

**Requirements:**
- Install `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`.
- Implement obsidian-themed block editor with slash command popover (`/todo`, `/code`, `/h2`, `/h3`, `/table`, `/quote`).
- Support interactive checklists checkable directly in the view and drag-and-drop image uploading.
- Replace raw textarea in `RequestDescriptionCard.tsx`.

- [ ] **Step 1: Install TipTap packages**
- [ ] **Step 2: Build `TipTapEditor.tsx` with slash commands menu**
- [ ] **Step 3: Integrate into `RequestDescriptionCard.tsx`**
- [ ] **Step 4: Verify build with `npm run build`**

### Task 18: Linear Action Execution in `⌘K` Palette
**Files:**
- Modify: `resources/js/Components/CommandPalette.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestHeroHeader.tsx`

**Requirements:**
- Enable keyboard-first command execution directly in `CommandPalette.tsx`:
  - `Assign to Robin` $\rightarrow$ updates active ticket assignee
  - `Set priority: Urgent` $\rightarrow$ sets priority
  - `Change status: Done` $\rightarrow$ marks ticket done
  - `Set due date: Tomorrow` $\rightarrow$ updates deadline
  - `Copy ticket link` $\rightarrow$ copies URL to clipboard
  - `Keyboard Shortcuts (?)` $\rightarrow$ opens cheat-sheet

- [ ] **Step 1: Add action command categories to `CommandPalette.tsx`**
- [ ] **Step 2: Connect commands to Inertia PATCH requests**
- [ ] **Step 3: Verify keyboard execution**

### Task 19: Roaming Kanban Preferences & Shortcut Discoverability
**Files:**
- Create: `database/migrations/2026_10_18_000018_add_preferences_to_users_table.php`
- Modify: `app/Models/User.php`
- Modify: `resources/js/Features/Requests/hooks/useKanbanBoard.ts`
- Modify: `resources/js/Components/Requests/BoardHeader.tsx`
- Modify: `resources/js/Components/ShortcutsModal.tsx`

**Requirements:**
- Add `preferences` JSON column to `users`.
- Roam Kanban view mode (`board` vs `list`) and collapsed column array in user preferences via debounced patch.
- Add `[ ? ]` keycap badge in `BoardHeader.tsx` opening `ShortcutsModal.tsx`.
- Add first-run empty and loading skeleton states to `KanbanBoard.tsx`.

- [ ] **Step 1: Run preferences migration**
- [ ] **Step 2: Roam Kanban preferences in database**
- [ ] **Step 3: Add `?` shortcut trigger badge and empty states**
- [ ] **Step 4: Run tests and verify**

---

### Module F: Developer Platform, Inbound Integrations & Webhooks

### Task 20: Public REST API v1 (`/api/v1/work-requests`, `/api/v1/projects`)
**Files:**
- Create: `app/Http/Controllers/Api/V1/WorkRequestApiController.php`
- Create: `app/Http/Controllers/Api/V1/ProjectApiController.php`
- Create: `app/Http/Resources/WorkRequestResource.php`
- Create: `app/Http/Resources/AreaResource.php`
- Modify: `routes/api.php`
- Test: `tests/Feature/WorkRequestApiV1Test.php`

**Requirements:**
- Build full CRUD under `/api/v1` guarded by `auth:sanctum`:
  - `GET /api/v1/work-requests` (paginated, filterable)
  - `POST /api/v1/work-requests` (creates ticket, returns 201)
  - `GET /api/v1/work-requests/{id}` (shows detail with relations/subtasks)
  - `PATCH /api/v1/work-requests/{id}` (updates attributes)
  - `DELETE /api/v1/work-requests/{id}` (soft-deletes)
  - `GET /api/v1/projects` (lists active initiatives)
- Eloquent API Resources with clean JSON schemas.

- [ ] **Step 1: Write failing API v1 tests**
- [ ] **Step 2: Create API Resources and Controllers**
- [ ] **Step 3: Register routes in `routes/api.php`**
- [ ] **Step 4: Run tests and verify**

### Task 21: Personal Access Tokens (PAT) Management UI
**Files:**
- Create: `app/Http/Controllers/PersonalAccessTokenController.php`
- Modify: `resources/js/Pages/Profile/Edit.tsx`
- Create: `resources/js/Features/Profile/components/PersonalAccessTokensCard.tsx`
- Test: `tests/Feature/PersonalAccessTokenTest.php`

**Requirements:**
- Add "Personal Access Tokens" card in Profile Settings.
- Allow users to generate tokens with custom names and expiration dates.
- Display token value once in a copyable modal with secret warning.
- List active tokens with last used timestamp and 1-click Revoke button.

- [ ] **Step 1: Write failing PAT tests**
- [ ] **Step 2: Implement `PersonalAccessTokenController` (store, destroy)**
- [ ] **Step 3: Build `PersonalAccessTokensCard.tsx` in Profile view**
- [ ] **Step 4: Run tests and verify**

### Task 22: Inbound Email-to-Ticket & Reply-to-Comment Webhook
**Files:**
- Create: `app/Http/Controllers/InboundEmailWebhookController.php`
- Create: `app/Services/InboundEmailParser.php`
- Modify: `routes/api.php`
- Test: `tests/Feature/InboundEmailWebhookTest.php`

**Requirements:**
- Add webhook endpoint `POST /api/webhooks/inbound-email` compatible with Postmark, Mailgun, and AWS SES.
- Parse `reply+req-{id}@{domain}` email addresses or ticket references in subject.
- Extract cleaned email reply text (stripping quoted history) and automatically post as a comment on the work request from the sender's user account.

- [ ] **Step 1: Write failing inbound email webhook test**
- [ ] **Step 2: Implement `InboundEmailParser` and controller**
- [ ] **Step 3: Register route and test payload processing**
- [ ] **Step 4: Run tests and verify**

### Task 23: Bidirectional GitHub / GitLab Pull Request Sync
**Files:**
- Create: `database/migrations/2026_10_18_000019_create_pull_requests_table.php`
- Create: `app/Models/PullRequest.php`
- Modify: `app/Http/Controllers/GitHubWebhookController.php`
- Modify: `app/Services/WorkRequestPresenter.php`
- Create: `resources/js/Features/Requests/components/Detail/RequestPullRequestsSection.tsx`
- Modify: `resources/js/Pages/Requests/Show.tsx`
- Test: `tests/Feature/GitHubPullRequestSyncTest.php`

**Requirements:**
- Table `pull_requests`: `id`, `work_request_id`, `provider`, `pr_number`, `title`, `url`, `status` (open, closed, merged), `is_draft`, `review_status` (pending, approved, changes_requested), `timestamps`.
- In `GitHubWebhookController`: listen to `pull_request` events. When a PR title or branch references `#REQ-104`, link PR to ticket.
- When PR is merged to `main`, automatically transition ticket status to `done` and log activity.
- Display PR badge cards in ticket detail with live status and checks indicator.

- [ ] **Step 1: Write failing GitHub PR sync tests**
- [ ] **Step 2: Create migration and `PullRequest` model**
- [ ] **Step 3: Update `GitHubWebhookController` to handle pull_request webhooks**
- [ ] **Step 4: Render linked PRs in ticket detail view**
- [ ] **Step 5: Run tests and verify**

### Task 24: Resilient Kanban Undo & Paginated Board Index
**Files:**
- Modify: `resources/js/Features/Requests/hooks/useKanbanBoard.ts`
- Modify: `app/Http/Controllers/WorkRequestController.php`
- Modify: `app/Http/Controllers/SettingsController.php`
- Modify: `resources/js/Features/Settings/components/WorkspaceSnapshotCard.tsx`

**Requirements:**
- In `useKanbanBoard.ts`: When clicking "Undo", dispatch a real PATCH request to the server reverting status back to `previousStatus`.
- If a status move fails on the server, display error toast and reconcile UI state with server truth instead of swallowing errors.
- In `WorkRequestController::index()`: Add cursor/pagination and limit query caps to prevent memory exhaustion on large datasets.
- In `SettingsController` and `WorkspaceSnapshotCard`: Add pagination and event filters to workspace audit logs.

- [ ] **Step 1: Implement server-side status rollback on Undo in `useKanbanBoard.ts`**
- [ ] **Step 2: Add pagination to `WorkRequestController` and audit log**
- [ ] **Step 3: Verify build and tests**

---

### Module G: Hygiene, Tooling, CI & Open-Source Release

### Task 25: Repository Root Cleanup & Screenshot Relocation
**Files:**
- Delete: Root `project` master prompt file
- Move: Root screenshots (`c1-sidebar.png` ... `v3-ideas.png`) $\rightarrow$ `docs/assets/`
- Create: `CODE_OF_CONDUCT.md`

**Requirements:**
- Completely remove internal `project` file from the repository.
- Move all 13 PNG screenshots into `docs/assets/` and update any markdown references.
- Create `CODE_OF_CONDUCT.md` using Contributor Covenant v2.1.

- [ ] **Step 1: Move screenshot assets to `docs/assets/`**
- [ ] **Step 2: Remove `project` file**
- [ ] **Step 3: Create `CODE_OF_CONDUCT.md`**

### Task 26: `.gitignore` and `composer.json` Branding Alignment
**Files:**
- Modify: `.gitignore`
- Modify: `composer.json`
- Modify: `README.md`

**Requirements:**
- Update `.gitignore` with `.DS_Store`, `.playwright-mcp/`, `database/database.sqlite`, `docs/superpowers/`, and `*.log`.
- In `composer.json`: Change name to `"relay/studio"`, license to `"Apache-2.0"`, update description, and remove unused dev packages (`"laravel/sail"`, `"laravel/breeze"`).
- In `README.md`: Update version badges to Laravel 13, React 19, PHP 8.4, and Apache 2.0; document all REST API v1 endpoints and Sanctum PAT usage.

- [ ] **Step 1: Update `.gitignore`**
- [ ] **Step 2: Update `composer.json` metadata and prune dev packages**
- [ ] **Step 3: Update `README.md` badges and documentation**

### Task 27: Localization (i18n) Foundations
**Files:**
- Create: `lang/en/workspace.php`
- Create: `lang/en/status.php`
- Create: `resources/js/lib/i18n.ts`
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`

**Requirements:**
- Provide translation dictionaries for statuses, priorities, and common UI labels.
- Share active translations with Inertia frontend and provide a lightweight `t(key)` helper.

- [ ] **Step 1: Create language files in `lang/en/`**
- [ ] **Step 2: Share translations in `HandleInertiaRequests`**
- [ ] **Step 3: Wire frontend translation helper**

### Task 28: Tooling, Linting & CI Static Analysis
**Files:**
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `phpstan.neon`
- Create: `.github/dependabot.yml`
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`

**Requirements:**
- Configure ESLint and Prettier for TypeScript and React 19.
- Configure PHPStan / Larastan at level 6.
- Create `.github/dependabot.yml` monitoring Composer, npm, and GitHub Actions.
- In `.github/workflows/ci.yml`: Add `npm run lint`, `vendor/bin/phpstan`, and `php artisan test` steps.

- [ ] **Step 1: Configure ESLint and Prettier**
- [ ] **Step 2: Configure PHPStan**
- [ ] **Step 3: Add Dependabot configuration and update GitHub Actions CI**

### Task 29: Full-Suite Verification & Initial Git Commit
**Files:**
- Repository Root

**Requirements:**
- Run `npm run build` and ensure 0 TypeScript / Vite errors.
- Run `php artisan test` and verify 100% pass across all test suites.
- Run `php artisan relay:doctor` and confirm 100% green checks.
- Stage clean files and create initial Git commit:
  `git commit -m "feat: complete Relay Studio enterprise platform with v1 API, hardened security, and Docker stack"`.

- [ ] **Step 1: Run full frontend build**
- [ ] **Step 2: Run full PHPUnit test suite**
- [ ] **Step 3: Run `php artisan relay:doctor`**
- [ ] **Step 4: Create initial Git commit**

---
