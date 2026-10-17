# Open-Source Enterprise Linear Master Plan (Relay Studio)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Relay Studio into a premier, enterprise-grade, open-source project management platform (competing with Plane, Linear, and Cal.com) featuring full ticket lifecycle controls (Due Dates, Soft Deletes, Tags, Dependencies, Document Attachments), rich collaboration (`@mentions`, Syntax Highlighting, Clone, Live Sync), power-user ergonomics (`⌘K` ticket search, URL filter sync, Vim shortcuts), enterprise governance (Audit Logs, Custom Error Pages, Notification Preferences), external integrations (CSV Export, GitHub PR autolink, Webhooks), and turnkey open-source distribution (`docker-compose.yml`, `relay:install` CLI wizard, and GitHub community files).

**Architecture:**
- Laravel 11 Backend + Inertia.js v2 + React 18 / TypeScript frontend in Obsidian dark aesthetic (`#07090e`, `#090a0f`, `#0c0d12`, `#121318`).
- Database schema extended with `due_date`, `SoftDeletes`, `tags`, `request_relations` (dependencies), and `workspace_audits`.
- High-performance, streaming CSV export, GitHub webhook parser, and outgoing webhook dispatcher.
- Full-width `max-w-[1600px]` responsive layout maintained across all screens.
- Zero-friction self-hosting via multi-stage Docker Compose and `php artisan relay:install`.

**Tech Stack:** Laravel 11, React 18, TypeScript, Inertia v2, Tailwind CSS, Headless UI, Sonner, Lucide React, Docker, Prism/Shiki, MySQL/PostgreSQL/SQLite.

**Spec:** Open-source architecture guidelines and modern Linear/Plane feature specification.

## Global Constraints
- Strictly maintain the dark obsidian palette (`#07090e`, `#090a0f`, `#0c0d12`, `#121318`) with specular highlights and no tacky neon.
- Maintain full widescreen layout (`max-w-[1600px]`) without dead margins.
- Zero breaking changes to existing routes, permissions, or models.
- Zero TypeScript / Vite compilation errors on `npm run build`.
- 100% passing tests on `php artisan test`.

---

### Task 1: Core Ticket Schema & Attributes: Due Dates, Soft Deletes & Tags Taxonomy

**Files:**
- Create: `database/migrations/2026_10_18_000001_add_due_date_soft_deletes_and_tags_to_requests.php`
- Modify: `app/Models/WorkRequest.php`
- Modify: `app/Http/Requests/WorkRequest/UpdateWorkRequestRequest.php`
- Modify: `app/Presenters/WorkRequestPresenter.php`
- Modify: `resources/js/types/workspace.ts`
- Modify: `resources/js/Features/Requests/components/RequestCard.tsx`
- Modify: `resources/js/Features/Requests/components/RequestListView.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestSidebarProperties.tsx`
- Test: `tests/Feature/WorkRequestAttributesTest.php`

**Interfaces:**
- Produces: `due_date: string | null`, `is_overdue: boolean`, `due_human: string | null`, `tags: string[]`, `deleted_at: string | null`
- Consumes: `WorkRequestPresenter::card()`, `WorkRequestPresenter::detail()`

- [x] **Step 1: Write the failing tests**
Create `tests/Feature/WorkRequestAttributesTest.php` testing:
- Setting a `due_date` correctly serializes in presenter with `is_overdue` calculation.
- Soft-deleting a request preserves it in `WorkRequest::withTrashed()` without permanently removing from DB.
- Restoring a soft-deleted request returns it to the active pipeline.
- Storing tags as JSON array (`['frontend', 'bug']`).

- [x] **Step 2: Run test to verify it fails**
Run: `php artisan test tests/Feature/WorkRequestAttributesTest.php`
Expected: FAIL (Columns and SoftDeletes missing).

- [x] **Step 3: Create and run migration**
Add `due_date` (nullable timestamp/date), `deleted_at` (`$table->softDeletes()`), and `tags` (`$table->json('tags')->nullable()`) to `requests`.
Run: `php artisan migrate`.

- [x] **Step 4: Update Model, Presenter, and Form Request**
- Add `use SoftDeletes;` to `WorkRequest.php`. Add `'due_date' => 'date'` and `'tags' => 'array'` casts.
- Update `WorkRequestPresenter.php` to format `due_date`, calculate `is_overdue = due_date->isPast() && status !== 'done'`, and include `tags`.
- Update `UpdateWorkRequestRequest.php` to validate `due_date` and `tags`.

- [x] **Step 5: Update Frontend Card & Detail View**
- In `RequestCard.tsx`: Display due date pill with color coding (Amber for today, Red for overdue, Gray for future) and tag pills.
- In `RequestListView.tsx`: Add "Due Date" and "Tags" columns.
- In `RequestSidebarProperties.tsx`: Add Date picker input for Due Date and Tag input chip manager.

- [x] **Step 6: Run tests and verify**
Run: `php artisan test tests/Feature/WorkRequestAttributesTest.php`
Expected: PASS.

---

### Task 2: Expanded File Attachments (PDFs, Logs, Documents, Code & ZIPs)

**Files:**
- Modify: `app/Services/RequestFileService.php`
- Modify: `app/Http/Controllers/RequestFileController.php`
- Modify: `resources/js/Features/Requests/components/Detail/RequestMediaGallery.tsx`
- Test: `tests/Feature/ExpandedFileUploadTest.php`

**Interfaces:**
- Produces: Support for `pdf`, `log`, `txt`, `json`, `zip`, `docx`, `png`, `jpg`, `mp4`, `webm`
- Consumes: `RequestFileService::upload()`

- [x] **Step 1: Write failing test for document upload**
Create `tests/Feature/ExpandedFileUploadTest.php` testing uploading a `.pdf` file and a `.log` file to a request and verifying it creates a `RequestFile` record with `type = 'document'`.

- [x] **Step 2: Run test to verify it fails**
Run: `php artisan test tests/Feature/ExpandedFileUploadTest.php`
Expected: FAIL ("Only image and video files are supported").

- [x] **Step 3: Update `RequestFileService.php`**
Update MIME type detection in `RequestFileService.php`:
- Images: `image/*` -> `'image'`
- Videos: `video/*` -> `'video'`
- Documents: `application/pdf`, `text/plain`, `application/json`, `application/zip`, `application/x-zip-compressed`, `text/csv`, `text/markdown`, `application/msword` -> `'document'`
- Bypass WebP transcoding job for non-image files, setting `processing_status = Ready`.

- [x] **Step 4: Update Frontend `RequestMediaGallery.tsx`**
Render appropriate file icon cards for documents:
- PDF: Red `FileText` icon with "PDF" tag.
- Logs / Code: Cyan `FileCode` icon with filename and byte size.
- Archives / ZIPs: Amber `FileArchive` icon.
- Direct download button opening `route('requests.files.show', [request, file])`.

- [x] **Step 5: Run tests and verify**
Run: `php artisan test tests/Feature/ExpandedFileUploadTest.php`
Expected: PASS.

---

### Task 3: Ticket Relationships & Dependency Resolution ("Blocked by #REQ-X")

**Files:**
- Create: `database/migrations/2026_10_18_000002_create_request_relations_table.php`
- Create: `app/Models/RequestRelation.php`
- Modify: `app/Models/WorkRequest.php`
- Modify: `app/Services/WorkRequestService.php`
- Create: `app/Http/Controllers/RequestRelationController.php`
- Modify: `resources/js/Features/Requests/components/Detail/RequestSidebarProperties.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestBlockerBanner.tsx`
- Test: `tests/Feature/RequestDependenciesTest.php`

**Interfaces:**
- Produces: `POST /requests/{request}/relations`, `DELETE /requests/{request}/relations/{relation}`
- Consumes: `WorkRequest::blockedBy()`, `WorkRequest::blocks()`

- [x] **Step 1: Write failing test for dependency resolution**
Create `tests/Feature/RequestDependenciesTest.php` testing:
- Linking ticket B as "blocked by" ticket A sets ticket B `is_blocked = true`.
- Marking ticket A as `done` automatically unblocks ticket B and logs activity.

- [x] **Step 2: Create migration and model**
Table `request_relations`:
- `id`
- `request_id` (foreignId)
- `related_id` (foreignId)
- `type` ('blocks', 'relates_to', 'duplicate')
- `created_at`, `updated_at`
- Unique index on `['request_id', 'related_id', 'type']`.

- [x] **Step 3: Update `WorkRequestService.php`**
In `update()`: When a request is marked `done`, query all tickets where `related_id = $request->id` and `type = 'blocks'`. If the ticket has no other active blocking tickets, automatically set `is_blocked = false` and record activity `"Unblocked: Dependency #REQ-{$request->id} completed."`.

- [x] **Step 4: Create Controller & Routes**
Add `Route::post('/requests/{request}/relations', [RequestRelationController::class, 'store'])` and `Route::delete('/requests/{request}/relations/{relation}', [RequestRelationController::class, 'destroy'])`.

- [x] **Step 5: Update Frontend Dependency Controls**
In `RequestSidebarProperties.tsx`: Add "Dependencies" section with ticket search picker ("Block by #REQ...") showing linked cards with status pill and unlink button.

- [x] **Step 6: Run tests and verify**
Run: `php artisan test tests/Feature/RequestDependenciesTest.php`
Expected: PASS.

---

### Task 4: Interactive Collaboration: `@mentions` Autocomplete, Syntax Highlighting & 1-Click Duplicate

**Files:**
- Modify: `app/Http/Controllers/RequestCommentController.php`
- Modify: `app/Services/WorkRequestService.php`
- Create: `app/Http/Controllers/RequestCloneController.php`
- Modify: `resources/js/Components/MarkdownViewer.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestDiscussionSection.tsx`
- Modify: `resources/js/Features/Requests/components/Detail/RequestHeroHeader.tsx`
- Test: `tests/Feature/CommentMentionsAndCloneTest.php`

**Interfaces:**
- Produces: `@mentions` notifications to parsed users, syntax-highlighted code blocks, `POST /requests/{request}/clone`
- Consumes: `WorkRequestService::addComment()`, `WorkRequestService::create()`

- [x] **Step 1: Write failing test**
Create `tests/Feature/CommentMentionsAndCloneTest.php` testing:
- Adding a comment containing `"Hey @hussien please check this"` dispatches a mention notification and email to user `hussien`.
- Cloning a request creates a duplicate with title `[Copy] Original Title` in `new` status.

- [x] **Step 2: Implement Mention Parsing in `RequestCommentController.php`**
Parse regex `/@([a-zA-Z0-9_\-\.]+)/` in comment body. Look up `User::whereIn('username', $usernames)`. Dispatch `RequestDatabaseNotification` with event `'mention'` to matched users.

- [x] **Step 3: Implement Clone Endpoint**
Create `RequestCloneController.php` duplicating request title, description, area_id, priority, and tags, returning Inertia redirect to the new ticket.

- [x] **Step 4: Add Syntax Highlighting in `MarkdownViewer.tsx`**
Style code blocks with colored syntax highlighting (keyword, string, function, comment tokens) in obsidian theme.

- [x] **Step 5: Add UI controls**
- In `RequestDiscussionSection.tsx`: Add `@` user mention autocomplete dropdown and highlight `@username` pills.
- In `RequestHeroHeader.tsx`: Add "Duplicate Ticket" action in header actions menu.

- [x] **Step 6: Run tests and verify**
Run: `php artisan test tests/Feature/CommentMentionsAndCloneTest.php`
Expected: PASS.

---

### Task 5: Power-User Ergonomics: Global Full-Text Search in `⌘K`, URL Filter Sync & Vim Navigation

**Files:**
- Create: `app/Http/Controllers/GlobalSearchController.php`
- Modify: `resources/js/Components/CommandPalette.tsx`
- Modify: `resources/js/Features/Requests/hooks/useBoardFilters.ts`
- Modify: `resources/js/Features/Requests/components/KanbanBoard.tsx`
- Test: `tests/Feature/GlobalSearchTest.php`

**Interfaces:**
- Produces: `GET /api/search?q={query}`, URL query string sync (`?project=...&status=...`), Vim keyboard navigation (`J`/`K`/`H`/`L`)
- Consumes: `CommandPalette.tsx`, `KanbanBoard.tsx`

- [x] **Step 1: Create Global Search Controller & Route**
`GlobalSearchController::class` queries `WorkRequest::query()->where('title', 'like', "%{$q}%")->orWhere('id', $q)->limit(8)` and `Area::query()->where('name', 'like', "%{$q}%")->limit(4)` returning JSON results.
Register `Route::get('/api/search', GlobalSearchController::class)->name('api.search');`.

- [x] **Step 2: Enhance `CommandPalette.tsx`**
When typing in `⌘K`, debounce query `/api/search?q=...` and display matched tickets with `#REQ-ID`, priority dot, project badge, and direct keyboard arrow navigation.

- [x] **Step 3: Sync URL Parameters in `useBoardFilters.ts`**
When user changes `preset`, `project`, `status`, or `search`, use `window.history.replaceState` or Inertia `router.visit` with `preserveState: true` to update the browser URL, and parse query parameters on initial page load.

- [x] **Step 4: Add Vim / Keyboard Card Navigation in `KanbanBoard.tsx`**
Listen for keyboard events (when not typing in an input):
- `J`: Focus next card down in current column.
- `K`: Focus previous card up.
- `H`: Move focus to adjacent left column.
- `L`: Move focus to adjacent right column.
- `Space` / `Enter`: Open slide-over quick view drawer.

- [x] **Step 5: Verify build & tests**
Run: `php artisan test tests/Feature/GlobalSearchTest.php` and `npm run build`.
Expected: PASS.

---

### Task 6: Enterprise Security & Governance: Custom Error Pages, Workspace Audit Logs & Notification Preferences

**Files:**
- Create: `resources/js/Pages/Error.tsx`
- Create: `database/migrations/2026_10_18_000003_create_workspace_audits_table.php`
- Create: `app/Models/WorkspaceAudit.php`
- Create: `app/Services/AuditService.php`
- Modify: `app/Http/Controllers/SettingsController.php`
- Modify: `app/Http/Controllers/ProfileController.php`
- Modify: `resources/js/Pages/Profile/Edit.tsx`
- Modify: `resources/js/Features/Settings/components/WorkspaceSnapshotCard.tsx`
- Test: `tests/Feature/WorkspaceAuditTest.php`

**Interfaces:**
- Produces: Obsidian Error Pages (404, 403, 500), `workspace_audits` logs, user notification preferences in `User::$casts['notification_preferences']`
- Consumes: `SettingsController`, `ProfileController`

- [x] **Step 1: Create Obsidian Error Page `resources/js/Pages/Error.tsx`**
Implement sleek obsidian error page handling 404 (Not Found), 403 (Forbidden), 500 (Server Error), and 419 (Session Expired) with status codes, error descriptions, "Back to Dashboard" button, and `⌘K` search shortcut button.

- [x] **Step 2: Create `workspace_audits` Migration & Service**
Table `workspace_audits`: `id`, `user_id`, `event` (e.g. `team.member_invited`, `team.role_changed`, `project.created`, `project.archived`), `auditable_type`, `auditable_id`, `old_values` (json), `new_values` (json), `ip_address`, `created_at`.
Create `AuditService::log(User $actor, string $event, Model $target, array $old = [], array $new = [])`.

- [x] **Step 3: Hook Auditing into Settings Actions**
Call `AuditService::log()` in `TeamMemberController::update`, `AreaController::store`, and `AreaController::destroy`.

- [x] **Step 4: Add Notification Preferences to Profile**
Add `notification_preferences` JSON column to `users`. Provide toggles in `Profile/Edit.tsx`:
- `email_on_assignment` (default: true)
- `email_on_status_change` (default: true)
- `email_on_comment` (default: true)
Update `SendRequestEmail.php` to respect user preferences before sending emails.

- [x] **Step 5: Run tests and verify**
Run: `php artisan test tests/Feature/WorkspaceAuditTest.php`
Expected: PASS.

---

### Task 7: Integrations, Data Portability & Webhooks: CSV/JSON Export, GitHub Autolink & Slack Alerts

**Files:**
- Create: `app/Http/Controllers/ExportController.php`
- Create: `app/Http/Controllers/GitHubWebhookController.php`
- Create: `app/Jobs/DispatchOutgoingWebhook.php`
- Create: `database/migrations/2026_10_18_000004_create_webhooks_table.php`
- Modify: `routes/web.php` and `routes/api.php`
- Modify: `resources/js/Features/Requests/components/BoardHeader.tsx`
- Test: `tests/Feature/ExportAndIntegrationTest.php`

**Interfaces:**
- Produces: `GET /requests/export?format=csv|json`, `POST /api/webhooks/github`, outgoing Slack/Discord webhooks
- Consumes: `WorkRequestService::update()`

- [x] **Step 1: Write failing tests**
Create `tests/Feature/ExportAndIntegrationTest.php` testing:
- Exporting requests returns streaming CSV with headers (`ID`, `Title`, `Project`, `Status`, `Priority`, `Assignee`, `Due Date`, `Created At`).
- Sending GitHub push payload with commit message `"Fix memory leak (fixes #REQ-1)"` transitions ticket 1 to `review` and records activity.

- [x] **Step 2: Implement CSV / JSON Export Controller**
Create `ExportController.php` using `Symfony\Component\HttpFoundation\StreamedResponse` generating standard CSV or JSON formatted exports matching active filter query parameters.

- [x] **Step 3: Implement GitHub Webhook Controller**
Create `GitHubWebhookController.php`:
- Parse commits array from GitHub push payload.
- Match regex `/fixes\s+#?REQ-([0-9]+)/i` or `/closes\s+#?REQ-([0-9]+)/i`.
- Look up `WorkRequest::find($id)`.
- Advance status to `review` or `done` and record git commit link activity.

- [x] **Step 4: Add Export Button to Board Header**
In `BoardHeader.tsx`: Add "Export" button dropdown (`[ CSV Export | JSON Export ]`) downloading the filtered backlog.

- [x] **Step 5: Run tests and verify**
Run: `php artisan test tests/Feature/ExportAndIntegrationTest.php`
Expected: PASS.

---

### Task 8: Open-Source Foundation: Docker Compose, Installation CLI & Repository Scaffolding

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `docker/nginx.conf`
- Create: `docker/php.ini`
- Create: `app/Console/Commands/RelayInstallCommand.php`
- Create: `app/Console/Commands/RelayDoctorCommand.php`
- Create: `README.md`
- Create: `LICENSE` (Apache 2.0)
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `.github/workflows/ci.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`

**Interfaces:**
- Produces: `docker compose up -d`, `php artisan relay:install`, `php artisan relay:doctor`, GitHub CI workflow
- Consumes: Laravel Artisan CLI, GitHub Actions

- [x] **Step 1: Create Production `Dockerfile` and `docker-compose.yml`**
Multi-stage build:
1. Node stage (`npm run build` client + SSR).
2. PHP 8.3 FPM + Nginx stage with extensions (`pdo_mysql`, `pdo_pgsql`, `pdo_sqlite`, `redis`, `gd`, `zip`, `opcache`).
`docker-compose.yml`: services for `relay-app`, `relay-db` (MySQL/Postgres), `relay-redis`, and `relay-mailpit`.

- [x] **Step 2: Create `php artisan relay:install` & `relay:doctor`**
- `relay:install`: Prompts for app URL, database credentials, runs migrations, prompts to create initial admin/owner account, and seeds workspace.
- `relay:doctor`: Runs verification checks on PHP version, memory limits, database connection, queue driver, writable storage dirs, and SSL.

- [x] **Step 3: Create GitHub Community Scaffolding & Hero README**
- `README.md`: High-contrast Linear-style hero banner, features list with screenshots, tech stack badges, 1-click deploy buttons (Railway, Render), local Docker quickstart, and API usage snippet.
- `LICENSE`: Apache 2.0.
- `CONTRIBUTING.md`: Development setup with Herd / Docker, PR conventions, Pint style guidelines, and test instructions.
- `.github/workflows/ci.yml`: GitHub Actions matrix running PHP 8.3, `composer test`, `npm run build`, and ESLint/Pint.

- [x] **Step 4: Final Full-Suite Verification**
Run `export PATH="/opt/homebrew/bin:$PATH"; npm run build` and `php artisan test`.
Confirm 100% test passing and clean build.
