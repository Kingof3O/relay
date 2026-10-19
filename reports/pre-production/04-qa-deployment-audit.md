# Relay Studio — Pre-Production QA / Deployment Audit (Agent 4)

Date: 2026-10-19
Repo: `/Volumes/Main/Herd/stm` @ `main` (94ce903), clean tree
Scope: testing, critical workflows, performance, Docker/install, ops/reliability, backup/restore, compatibility, 35 master features
Policy: audit-only; no source/test/config/migration/Docker/infra changes. Only write: this report. Scratch in `/tmp`. No destructive commands against `stm`; `stm_testing` treated as disposable. No real email/webhooks/external services. No `docker compose up/build`, no `relay:install` against `stm`, no `npm run dev`.

---

## 1. Methodology & Limitations

Evidence used: exact command runs (exit codes + output), static inspection with `file:line` cites, read-only DB checks (`EXPLAIN`, query counting) against disposable `stm_testing`, and `php artisan relay:doctor` (explicitly sanctioned; observed mutation: writes and deletes one `_relay_doctor_healthcheck_*` cache key and can create storage dirs — all pre-existing here).

Limitations (explicit):
- No `docker compose build/up` (resource policy) → Docker findings are static-evidence (CONFIRMED-BY-CODE) unless marked SUSPECTED-runtime.
- CI (`.github/workflows/ci.yml`) was not executed; CI findings cite workflow + command behavior.
- No fresh-clone install (`composer install`/`npm ci` from zero) → fresh-checkout install status NOT ASSESSED.
- No frontend test runner exists; UI behavior claims rest on static review only.
- Performance numbers are micro-measurements on 50 synthetic rows in `stm_testing` or empty `stm`; no production-scale benchmark claimed.
- Local DB is MariaDB 12.3.2 while CI/compose target MySQL 8.4; local runtime never exercised MySQL 8.4 or Redis (local Redis down).
- `php artisan test` ran under phpunit.xml (env=testing, mysql/`stm_testing`, cache/session=array, queue=sync, mail=array). Suite was run twice; results identical.
- `README.md`/`docs/` treated as intent, not evidence.

Environment verified: PHP 8.4.22, Composer 2.10.2, Node 22.23.0, npm 10.9.8. Installed: laravel/framework v13.33.0, phpunit/phpunit 13.3.4, inertiajs/inertia-laravel v3.3.4, laravel/sanctum v4.3.3, pragmarx/google2fa v9.1.0, react 19.3.0, @inertiajs/react 3.7.1, vite 8.3.0, typescript 5.9.3, @hello-pangea/dnd 18.0.1, recharts 3.10.1. `laravel/reverb`, `laravel-echo`, `pusher-js` NOT installed; no `config/reverb.php`, no `config/broadcasting.php` (framework defaults apply). `vendor/bin/phpstan` absent though `phpstan.neon` exists (level 6).

---

## 2. Exact Command Matrix

| # | Command | Exit | Observed result |
|---|---------|------|-----------------|
| 1 | `php artisan test` (run 1) | 0 | `195 passed (1055 assertions)`, 19.17s; no FAIL/WARN/RISKY/SKIP lines |
| 2 | `php artisan test` (run 2, exit-code capture) | 0 | `195 passed (1055 assertions)`, 17.44s |
| 3 | `npx tsc --noEmit` | 0 | no output |
| 4 | `npm run lint` (eslint resources/js) | 0 | **0 errors, 75 warnings** (unused imports etc.) |
| 5 | `npm run build` (`tsc && vite build && vite build --ssr`) | 0 | client 3318 modules, 623ms; SSR 99 modules, 42ms; chunk-size warning (>500 kB) |
| 6 | `./vendor/bin/pint --test` | **1** | **5 files failing style**: `database/seeders/DemoWorkspaceSeeder.php`, `app/Http/Middleware/HandleInertiaRequests.php`, `app/Http/Controllers/InboundEmailWebhookController.php`, `app/Http/Controllers/RequestRelationController.php`, `tests/Feature/EdgeCasesAndRaceConditionsTest.php` |
| 7 | `composer audit` | 0 | `No security vulnerability advisories found.` |
| 8 | `npm audit` | **1** | 3 vulns: 2 high (`browserslist` GHSA-c83g-rgw3-j3cx / GHSA-73wf-gq98-2v4g, `source-map-js` GHSA-68fv-2mgg-jv7q), 1 moderate (`baseline-browser-mapping` GHSA-w5vr-8v7q-w6rv); all build-toolchain deps |
| 9 | `php artisan relay:doctor` | 0 | 23 PASS / 1 WARN (Redis refused — local Redis not running) / 0 FAIL; DB `mysql (db: stm, server: 12.3.2-MariaDB)`, 37 migrations, manifest 8.08 KB |
| 10 | `docker compose config` | 0 | valid; name `relay-studio`; app+db+redis+mailpit; APP_KEY interpolated non-empty from local `.env` (value redacted) |
| 11 | `php artisan route:list --except-vendor` | 0 | 82 output lines (~79 routes) |

Build sizes (fresh `public/build`, 25 files, 2.0 MB total; SSR `bootstrap/ssr` 808 KB):

| Asset | Raw | Gzip |
|---|---|---|
| `AuthenticatedLayout-*.js` | 660.14 kB | 185.58 kB |
| `vendor-charts-*.js` (recharts) | 371.84 kB | 107.99 kB |
| `dist-*.js` (TipTap) | 320.55 kB | 100.86 kB |
| `app-*.css` | 159.72 kB | 21.83 kB |
| `vendor-ui-*.js` | 150.45 kB | 47.84 kB |
| `vendor-dnd-*.js` | 83.53 kB | 25.34 kB |
| `Edit-*.js` | 54.13 kB | 10.76 kB |
| `app-*.js` (entry) | 54.59 kB | 20.48 kB |

Query measurement (read-only script; `stm_testing`, 50 seeded requests, exact controller shape from `WorkRequestController::index`):

```
requests hints: board_rows=50 queries=54 elapsed_ms=23
EXPLAIN: {"type":"ALL","possible_keys":"requests_workspace_id_foreign","key":null,"rows":"50","Extra":"Using where; Using filesort"}
```

Note: `stm` itself contains 0 rows (0 requests, 0 workspaces) — fresh install; measurements therefore used `stm_testing`.

Repo state after all runs: `git status --porcelain` → `?? reports/` only (pre-existing); `public/build` and `.phpunit.result.cache` are gitignored. No tracked file changed.

---

## 3. Test Results & Assessment

Suite: 42 files (41 test classes + `TestCase`), 195 test methods, 1055 assertions, 17–19s. All pass, twice. No skips, no risky, no warnings surfaced by artisan test. Test isolation is sound: `RefreshDatabase` migrates `stm_testing` once and wraps tests in transactions; `DatabaseTransactions` tests roll back; seeders (`IndependentWorkspaceSeeder`) are idempotent (`firstOrCreate`/`updateOrCreate`); `phpunit.xml` forces array cache/session, sync queue, array mail, so no external side effects and no dev-DB touches.

Quality: generally strong, behavior-level HTTP/service assertions (409 conflict, signed invite rejection, cycle rollover idempotency, mention bounding, cross-workspace rejection, webhook flows). Weak spots:

- `tests/Unit/ExampleTest.php:12` — `assertTrue(true)`; the entire "Unit" suite is a placeholder.
- `tests/Feature/EdgeCasesAndRaceConditionsTest.php:254` — "idempotent under concurrency" is two sequential calls; the real protection is `lockForUpdate` in `CycleService.php:148`, so the test does not exercise concurrency (claim is weaker than its name).
- `tests/Feature/ExportAndIntegrationTest.php:84` — posts an UNSIGNED GitHub webhook, locking in the fail-open behavior (see QA-003).
- No job/worker execution tests (all queue assertions use fakes); no ffmpeg/video pipeline test; no test of `ProcessRequestFile` timeout behavior.
- No frontend tests at all (see QA-021). Features 14/15/17/18/19 are UI-only in practice.

Missing coverage (critical-path): registration/onboarding beyond invites (no signup exists, no test needed by design); concurrent multi-session editing (single-process simulation only); offline/reconnect; real-time delivery (no Echo/Reverb); load/throughput; backup/restore; Docker runtime; fresh-clone install; permission-matrix completeness for API v1 (API update lacks `changeStatus`/`assign` checks — QA-030).

---

## 4. Finding Register

Status: CONFIRMED = reproduced/statically certain from cited code; SUSPECTED = strong static inference, not executed. "Runtime" items could not be exercised (no container run).

### QA-001 [P1] Docker: PHP-FPM runs as `www-data`, storage owned by `relay` → runtime writes fail
- Feature: 21 Files / 33 Docker; Status: CONFIRMED (static), runtime unverified
- Evidence: `Dockerfile:94-104` creates user `relay:1000` and `chown -R relay:relay storage bootstrap/cache` (mode 775 only; group `relay`). `docker/entrypoint.sh:17-18` re-applies `relay:relay`. No FPM pool override anywhere (`RUN`/conf files); official `php:8.3-fpm-alpine` pool defaults to `user = www-data`. `supervisord.conf` runs `php-fpm -F` as root → workers drop to `www-data`, which is not in group `relay`.
- Observed vs expected: Web-process writes into `storage/` (compiled views on error, `laravel.log`, and `Storage::disk('local')` uploads under `storage/app/private/request-staging` and final `requests/{id}/...`) will be denied. Expected: the runtime user owns storage or is in group `relay`.
- Fix: set FPM pool `user/group` to a user in group `relay` (e.g., `www-data` added to `relay`) or chown to `www-data`, or run FPM as `relay` and ensure `relay` uid matches the volume. Effort: S.
- Regression test: container smoke test that uploads a document image and asserts 200 + file exists (CI job with `docker compose up` health probe).

### QA-002 [P1] Video pipeline guaranteed to be killed: worker timeout 90s vs ffmpeg 3600s
- Feature: 21 Files; Status: CONFIRMED (static), runtime unverified
- Evidence: `docker/supervisord.conf:27` `queue:work --sleep=3 --tries=3 --timeout=90`; `RequestFileProcessingService.php:185` ffmpeg `setTimeout(3600)`; `ProcessRequestFile.php:18` `$tries = 1` and no `$timeout` property. Any transcode >90s is killed by the worker; `tries=1` means no retry.
- Observed vs expected: Large/1080p videos will fail processing in the shipped Docker stack. Expected: job `$timeout` ≥ ffmpeg budget and worker `--timeout` ≥ job timeout, with `retry_after` above both.
- Fix: add `public int $timeout = 3600;` to the job, raise worker `--timeout` (e.g. 3700), set `QUEUE retry_after` accordingly; consider dedicated media queue. Effort: S.
- Regression test: integration test with a synthetic >90s-media job or a stubbed slow processor asserting completion under configured timeout.

### QA-003 [P1] GitHub webhook signature is fail-open; unauthenticated callers can mutate tickets
- Feature: 25 GitHub; Status: CONFIRMED
- Evidence: `GitHubWebhookController.php:19-29` verifies HMAC **only if** `services.github.webhook_secret` or a `webhooks` row secret is non-empty; otherwise it proceeds. `GITHUB_WEBHOOK_SECRET` is absent from `.env.example` (grep: no match) and `config/services.php:39` defaults to null; no seeder sets a `github` webhook row. `routes/api.php:24` is unauthenticated and unthrottled.
- Observed vs expected: Anyone can `POST /api/webhooks/github` with a `merged` PR body referencing `REQ-<id>` to force tickets to `done`, or a commit message to force `review`, and add activities/notifications. Expected: reject unsigned payloads when a secret is configured, and require configuration (fail closed) in production docs/installer.
- Fix: make secret mandatory in production (config guard at boot or `relay:doctor` FAIL); document `GITHUB_WEBHOOK_SECRET` in `.env.example`; add throttle. Effort: S.
- Regression test: unsigned request → 401 when secret configured (exists only conditionally; add explicit test), plus signed request → 200.

### QA-004 [P1] Auto cycle rollover is never scheduled
- Feature: 11 Auto rollover / 10 Cycles; Status: PARTIAL (CONFIRMED)
- Evidence: `app/Console/Commands/RolloverCycleCommand.php` exists and is correct (`lockForUpdate` in `CycleService.php:148`), but `routes/console.php:1-8` schedules only `inspire`; no `withSchedule` in `bootstrap/app.php`; `docker/supervisord.conf` has no `schedule:work`; README never mentions cron. Only the manual route `routes/web.php:60` (`cycles.rollover`) triggers rollover.
- Observed vs expected: Expired cycles stay active forever on a default deployment. Expected: scheduled `relay:cycle-rollover` (Laravel scheduler) or documented cron.
- Fix: add schedule entry (e.g. hourly/daily) + `schedule:work` process in supervisord or documented cron; note in README. Effort: S.
- Regression test: `Schedule` assertion (`$this->artisan('schedule:list')` contains cycle-rollover) or command invocation test (already exists, `CyclesEngineTest.php:150`).

### QA-005 [P1] Docker APP_KEY is ephemeral by default; 2FA secrets and sessions become undecryptable
- Feature: 31 2FA / 33 Docker / 34 Installer; Status: CONFIRMED (static)
- Evidence: `docker-compose.yml:17` `APP_KEY: "${APP_KEY}"` (empty unless operator exports it); `docker/entrypoint.sh:21-24` generates a new key on **every** boot when unset; README quickstart only says `docker compose up -d`. `User.php:67-68` casts `two_factor_secret`/`two_factor_recovery_codes` as `encrypted` → a restarted container loses the ability to decrypt them (and invalidates encrypted sessions/cookies). `.env` is excluded from the image (`.dockerignore:8`).
- Observed vs expected: Restarts silently break 2FA and log everyone out; multiple replicas diverge. Expected: persist APP_KEY (env/secret) and document it as mandatory in production.
- Fix: document/require `APP_KEY` (e.g. fail fast in production if unset, or use `key:generate --show` in quickstart); warn that generated keys are ephemeral. Effort: S.
- Regression test: compose smoke test asserting APP_KEY stable across `restart` (or doctor FAIL on missing key in production).

### QA-006 [P1] Pint style gate fails on `main` — CI is red
- Feature: CI/quality; Status: CONFIRMED
- Evidence: `./vendor/bin/pint --test` exit **1**, 5 files (section 2 row 6). `.github/workflows/ci.yml:112-113` runs `./vendor/bin/pint --test` on every push/PR.
- Observed vs expected: Repository cannot pass its own declared gate. Expected: clean style or gate relaxed.
- Fix: run `./vendor/bin/pint` and commit, or fix the 5 files manually. Effort: XS.
- Regression test: CI itself.

### QA-007 [P1] CI doctor step likely fails before migrations (database cache store has no `cache` table yet)
- Feature: 35 Doctor / CI; Status: SUSPECTED (strong static; Actions not run)
- Evidence: `ci.yml:72-75` copies `.env.example` (which sets `CACHE_STORE=database`, `.env.example:39`) and `key:generate`; `ci.yml:77-87` runs `relay:doctor` **before** `ci.yml:89-97` `migrate`. Doctor's cache check (`RelayDoctorCommand.php:141-154`) writes/reads the database cache store; with the `cache` table absent it throws → caught → `FAIL` → `failCount=1` → command returns FAILURE (`:46`), failing the step. The doctor test only passes because phpunit.xml forces `CACHE_STORE=array` (`tests/Feature/RelayCliCommandsTest.php:18-22`).
- Fix: move doctor after migrations, or run doctor with `CACHE_STORE=array`/`redis`, or make cache-table-missing a WARN in CI context. Effort: XS.
- Regression test: CI run.

### QA-008 [P2] Board load N+1: one `COUNT` query per card
- Feature: 2 Kanban / performance; Status: CONFIRMED
- Evidence: Measured 50 rows → **54 queries** (`/tmp` script mirroring `WorkRequestController.php:43-54`). Root cause: `WorkRequestPresenter.php:178` calls `$request->loadCount('files')` per model; the controller does not use `withCount('files')`. Dashboard amplifies it: `DashboardService.php:206-213` maps 5×8 cards through the same presenter.
- Observed vs expected: ~1 query/row on hot paths. Expected: 1 aggregate query (`withCount`).
- Fix: add `->withCount('files')` to the board/API/dashboard queries and have the presenter consume `files_count` when present. Effort: S.
- Regression test: query-count assertion (`DB::listen`) around board index for N rows ≤ fixed bound.

### QA-009 [P2] Board has no pagination; hard truncation at 250/500 rows
- Feature: 2 Kanban / large workspaces; Status: CONFIRMED (design cap, locked by test)
- Evidence: `WorkRequestController.php:38-51` — `$queryCap = 250`, `$maxCap = 500`, `->limit(...)->get()`; no cursor/page. `KanbanUndoAndPaginationTest.php:75-96` verifies only the cap behavior.
- Observed vs expected: Workspaces >500 issues silently lose visibility of older items on board/list. Expected: pagination/infinite scroll with stable ordering.
- Fix: cursor pagination keyed on the current sort tuple, or documented filter-based windows. Effort: M.
- Regression test: create 501+ rows and assert second page retrieval.

### QA-010 [P2] `orWhereNull('workspace_id')` re-includes legacy rows across tenants (API v1, export, search)
- Feature: 28 Tenant isolation / 22 API / 27 Exports; Status: CONFIRMED (code), impact SUSPECTED (needs legacy null rows)
- Evidence: `WorkRequestApiController.php:32`, `ExportController.php:20`, `GlobalSearchController.php:34,59` all match `workspace_id = active OR workspace_id IS NULL`, while the web board filters strictly (`WorkRequestController.php:44`). Tests cover only non-null rows (`EdgeCasesAndRaceConditionsTest.php:142-199`).
- Observed vs expected: Any row with NULL workspace (schema permits: migration `2026_10_18_000011` adds nullable FK) is visible/exportable from every workspace. Expected: consistent strict scoping or an explicit legacy-migration plan.
- Fix: backfill workspace_id for all rows, then drop the `orWhereNull`; or gate it behind an admin/legacy flag. Effort: S.
- Regression test: NULL-workspace row must not appear for a non-owning workspace.

### QA-011 [P2] Inbound-email webhook: unsigned, unthrottled, spoofable sender; email-existence oracle
- Feature: 24 Inbound email; Status: CONFIRMED
- Evidence: `InboundEmailWebhookController.php:15-95` trusts `From`/`To` payload fields; no shared secret/HMAC check; `routes/api.php:25` unauthenticated and unthrottled. A valid comment triggers `notifyRelevantUsers` → DB notification + queued email (`WorkRequestService.php:212-240`).
- Observed vs expected: Anyone who knows a member email + ticket id can inject comments and trigger notification email floods. Expected: provider signature/shared-secret verification + rate limit.
- Fix: require `INBOUND_EMAIL_SECRET` (fail closed in production), verify provider signatures (Mailgun/SendGrid), throttle. Effort: M.
- Regression test: unsigned/secret-mismatch request → 401; throttled burst → 429.

### QA-012 [P2] Real-time stack absent in every environment
- Feature: 19 Presence / notifications; Status: PARTIAL, CONFIRMED
- Evidence: `app/Events/WorkRequestMoved.php:16` / `WorkRequestCommented.php:17` implement `ShouldBroadcast`; `routes/channels.php` defines workspace/request channels; but `package.json` lacks `laravel-echo`/`pusher-js`, no Echo bootstrap exists (`LivePresenceAvatars.tsx:44-45` reads `window.Echo` and silently returns when missing), no Reverb/Pusher service in `docker-compose.yml`, no `BROADCAST_CONNECTION` in compose (defaults to `log`/null). Tests assert only event dispatch + channel auth (`ReverbRealtimeBroadcastTest.php`).
- Observed vs expected: Presence shows only yourself; board moves/comments never push to other users. Expected (per feature list): live presence/updates.
- Fix: ship Reverb (or Pusher) config + service + Echo client, or explicitly descope realtime from marketing claims. Effort: L.
- Regression test: browser E2E subscribing to `private-workspace.{id}` and receiving an update (and presence join/leave).

### QA-013 [P2] PAT abilities are cosmetic — API routes never enforce them
- Feature: 23 PATs; Status: PARTIAL, CONFIRMED
- Evidence: `routes/api.php:14` guards with `auth:sanctum` only (no `abilities:`/`ability:` middleware). `PersonalAccessTokenController.php:34` defaults arbitrary requests to `['*']`; any created ability set is stored but never checked.
- Observed vs expected: A token created with minimal abilities has full API access. Expected: per-endpoint ability enforcement or omission of the abilities UI.
- Fix: add `abilities:...` middleware per route group and map read/write scopes. Effort: S.
- Regression test: read-only token POST → 403.

### QA-014 [P2] No backup/restore capability anywhere
- Feature: ops; Status: MISSING (CONFIRMED by absence)
- Evidence: repo-wide text search for `backup|restore` matches only `stdout_logfile_backups` in `docker/supervisord.conf`. No scripts, cron, docs, or DB dump/attachment snapshot tooling. Compose volumes `db_data`, `redis_data`, `app_storage` have no snapshot policy.
- Fix: document and script encrypted mysqldump + storage snapshot + restore drill; add retention. Effort: M.
- Regression test: restore drill in CI/staging (documented runbook result).

### QA-015 [P2] No monitoring/error tracking/alerting; request logs unbounded
- Feature: ops; Status: MISSING/PARTIAL
- Evidence: composer has no sentry/telescope/pulse/tideways; `.env.example:18` `LOG_STACK=single` (and compose doesn't override) → `storage/logs/laravel.log` grows without rotation on the `app_storage` volume; only the worker log rotates 5MB×2 (`supervisord.conf:33-35`). No uptime/health probe target (see QA-028), no queue-failure alerting (`failed_jobs` table exists but nothing inspects it).
- Fix: ship log rotation (`daily` + `LOG_DAILY_DAYS`), an error tracker binding, and failed-jobs alerting; add `/up` healthcheck monitoring. Effort: M.
- Regression test: ops runbook + a failing-job alert smoke test in staging.

### QA-016 [P2] No proxy/TLS awareness; secure-cookie posture unset
- Feature: ops/HTTPS; Status: PARTIAL
- Evidence: `bootstrap/app.php` has no `trustProxies` configuration; `config/session.php:173` `secure => env('SESSION_SECURE_COOKIE')` and `.env.example` does not set it; compose publishes plain `8080:80` with no TLS terminator or reverse-proxy docs; nginx sends HSTS unconditionally (`docker/nginx.conf:60`) even over HTTP.
- Observed vs expected: Behind a real HTTPS proxy, scheme detection and cookie security depend on untrusted X-Forwarded-* headers. Expected: documented TLS termination + `TrustProxies` + secure cookies.
- Fix: configure `trustProxies(at: '*')` only in documented proxy deployments, set `SESSION_SECURE_COOKIE=true`, provide TLS/reverse-proxy example. Effort: S.
- Regression test: feature test with forwarded-proto headers asserting secure URL generation/cookies.

### QA-017 [P2] Compose exposes Redis/Mailpit to the host; weak default credentials
- Feature: 33 Docker / ops; Status: CONFIRMED (static)
- Evidence: `docker-compose.yml:68-69` publishes `6379:6379`; `:82-84` publishes Mailpit `1025/8025`; Redis password defaults to empty (`:26,65-67`); DB password defaults `secret` / root `rootsecret` (`:23,50-51`). MySQL itself is not published (good).
- Fix: don't publish Redis/Mailpit in production compose (or bind 127.0.0.1); require secrets via env with no weak defaults; split dev/prod compose files. Effort: S.
- Regression test: `docker compose config` lint asserting no public Redis port in prod profile.

### QA-018 [P2] Upload size limits disagree across layers; documents read fully into memory
- Feature: 21 Files; Status: CONFIRMED
- Evidence: `.env.example:68` `REQUEST_MAX_FILE_SIZE_KB=512000` (500 MB) vs `docker/nginx.conf:25` `client_max_body_size 64M` vs `docker/php.ini:3-4` 64M; `RequestFileService.php:26-31` hardcodes the error message "64 MB or smaller"; `RequestFileService.php:78` `file_get_contents()` loads the whole document into PHP memory (256M limit, `docker/php.ini:2`).
- Observed vs expected: Uploads 64–500 MB are rejected by nginx/PHP before validation; a ~64 MB doc can consume ~64-128 MB of the 256 MB limit; multiple files per request multiply this. Expected: consistent limits ≤ proxy/PHP bounds and streamed writes.
- Fix: align config (drop env default to 65536), stream with `fopen`/`putFileAs`, correct the message. Effort: S.
- Regression test: boundary upload tests at message limit and over-limit rejection with correct error text.

### QA-019 [P2] Global search is an unindexed `LIKE '%q%'` scan
- Feature: search/palette performance; Status: CONFIRMED (code), scale risk SUSPECTED
- Evidence: `GlobalSearchController.php:37-38` leading-wildcard LIKE on `title`/`description` with `limit 8`; no FULLTEXT index in migrations (grep of migrations shows only btree indexes). Palette debounce not verifiable (no JS tests).
- Fix: MySQL FULLTEXT or search index (Meilisearch/Scout) when volume grows; minimum query length + debounce. Effort: M.
- Regression test: timed query test with 100k rows or EXPLAIN asserting index use after change.

### QA-020 [P2] `retry_after` (90) equals worker `--timeout` (90)
- Feature: queue reliability; Status: CONFIRMED (static)
- Evidence: `config/queue.php:42` `retry_after => 90` (DB; Redis equivalent lower in file), `docker/supervisord.conf:27` `--timeout=90`. If a worker is killed mid-job, the same job may be retried while/after the first attempt, risking duplicate email/file processing.
- Fix: set `retry_after` above the max job timeout once QA-002 is fixed (e.g. 3700) and ensure unique jobs for email dispatch. Effort: XS.
- Regression test: config assertion test (`retry_after > worker timeout`).

### QA-021 [P2] Zero frontend automated tests
- Feature: 4/14/15/17/18/19 UI, all React; Status: CONFIRMED
- Evidence: `package.json:4-9` scripts only `dev/build/build:ssr/lint`; no vitest/jest/playwright deps or config anywhere. UI logic (optimistic drag/undo, palette, keyboard nav, TipTap markdown, presence fallback) is verified by nothing but `tsc` and lint.
- Fix: add Vitest + React Testing Library for hooks/components, and a small Playwright E2E for board drag/undo/palette. Effort: M.
- Regression test: the new suites in CI.

### QA-022 [P3] Unit suite is a placeholder
- `tests/Unit/ExampleTest.php:12-15` `assertTrue(true)`; no other unit tests. Effort: XS to remove/replace.

### QA-023 [P3] Dead duplicate frontend trees remain
- Evidence: complete legacy duplicates under `resources/js/Components/Requests/*` (e.g. `BoardFilterBar.tsx` 14 KB, `QuickViewDrawer.tsx` 30 KB) and `resources/js/Features/Requests/*` (20 KB/30 KB versions); duplicate hooks `resources/js/Hooks/useKanbanBoard.ts` + `Features/Requests/hooks/useKanbanBoard.ts`. `Pages/Requests/Index.tsx:6-16` imports only `@/Features/Requests`. `ArchitectureCleanupTest` purged other dead files but not these.
- Fix: delete unreferenced duplicates after an import sweep. Effort: S.

### QA-024 [P3] PHPStan configured but not installed
- `phpstan.neon` level 6 targets `app`, `bootstrap/app.php`, `config`, `routes`; `composer.json:18-25` has no phpstan/phpstan; `vendor/bin/phpstan` absent. Static-analysis gate effectively off. Fix: `composer require --dev larastan/larastan` and add to CI. Effort: S.

### QA-025 [P3] Version-floor and docs inconsistencies
- README badge PHP 8.4+ (`README.md:10`) vs `composer.json:8` `^8.3` vs doctor `>= 8.2.0` (`RelayDoctorCommand.php:61`) vs Docker `php:8.3-fpm-alpine` (`Dockerfile:36`). README doctor sample shows "21 migrations" but actual is 37 (`relay:doctor` output); sample DB is "relay, server 8.4.0" while local is MariaDB. Fix: align docs/config. Effort: XS.

### QA-026 [P3] npm audit: 2 high + 1 moderate in build toolchain
- Command row 8. `browserslist`, `source-map-js`, `baseline-browser-mapping` (transitive of tooling). `npm audit fix` available according to output. Composer audit clean. Fix: bump lockfile. Effort: XS.

### QA-027 [P3] 75 ESLint warnings (0 errors)
- Mostly unused imports/vars (e.g. `Pages/Error.tsx:9 ArrowLeft`, `Pages/Roadmap/Index.tsx:9-11`, `types/models.ts:2-10`), one stale disable directive. Fix: sweep. Effort: S.

### QA-028 [P3] Docker image/Compose hardening gaps
- No `HEALTHCHECK` in `Dockerfile`; `app` service has none (`docker-compose.yml:4-41`); no resource limits; no `USER` directive (supervisord/nginx master as root); `redis` dependency uses `condition: service_started` despite a healthcheck (`docker-compose.yml:38-39,72-76`). Fix: add app healthcheck (`/up`), mem/cpu limits, `depends_on: service_healthy`, and a non-root-capable setup once QA-001 is solved. Effort: M.

### QA-029 [P3] Legacy unused tables still created by migrations
- `database/migrations/2026_01_02_000004..8` create `projects`, `ideas`, `follow_ups`, `files`, `tasks` even though models/policies were deleted (asserted by `ArchitectureCleanupTest.php:168-190`). Fix: add drop migration or squash. Effort: S.

### QA-030 [P2] API v1 update bypasses `changeStatus`/`assign` permissions used by the web path
- Evidence: `WorkRequestApiController.php:85-108` authorizes only `update` and validates `assignee_id` with `exists:users,id` (no `active` constraint), while web enforces `changeStatus`/`assign` and active assignees (`UpdateWorkRequestRequest.php:23-29,53`). A user allowed to edit but not reassign can change status/assignee via API. Fix: mirror policy checks. Effort: S. Regression test: API PATCH status/assignee without permission → 403.

### QA-031 [P3] Deployment env documentation gaps
- `.env.example` lacks `GITHUB_WEBHOOK_SECRET` (used in `config/services.php:39`), any inbound-email secret (QA-011), `SESSION_SECURE_COOKIE`, TLS/proxy guidance, and scheduler/backup/monitoring pointers. `REQUEST_MAX_FILE_SIZE_KB=512000` misleads (QA-018). Effort: S.

### QA-032 [P3] `relay:install` non-interactive defaults create `admin@relay.studio` / `admin` / password `password`
- Evidence: `RelayInstallCommand.php:232-245`; `force_password_reset=true` mitigates (`:244`; tested in `WorkspaceInvitationTest.php`), but the account exists with a guessable password until first login. Fix: require `--admin-password` in non-interactive mode or auto-generate and print once. Effort: XS.

### QA-033 [P3] No upgrade/rollback/zero-downtime guidance; migrate-on-boot
- `docker/entrypoint.sh:27-28` runs `migrate --force --isolated` every boot (fine single-node, but concurrent replicas + no rollback plan/documented backup-before-migrate). Fix: document maintenance/upgrade runbook. Effort: S.

### QA-034 [P3] CI lacks security/dependency and static-analysis gates
- `ci.yml` runs lint/build/test/pint only: no `composer audit`, no `npm audit`, no PHPStan, no coverage threshold, single DB engine (MySQL 8.4), Node 20 only. Fix: add audit steps (already-failing npm findings visible), PHPStan once installed. Effort: S.

### QA-035 [P3] `stm` local DB is empty — no demo data verified for local development / doctor "deployment-ready" wording
- `requests_total=0 workspaces_total=0`; `relay:doctor` still says "deployment-ready" (it does warn on migrations only if table missing). Not a defect per se; noted so operators know doctor does not verify data/seed state. Effort: XS (wording).

---

## 5. Critical Workflow Assessment (Scope B)

| Workflow | Status | Evidence |
|---|---|---|
| Registration/onboarding | PARTIAL (by design) | No self-registration route (`routes/auth.php`): login + OAuth + invites only; owner created by `relay:install`; invite acceptance public (`routes/web.php:31-32`) |
| Workspace creation | VERIFIED | `workspaces.store`; `MultiTenancyWorkspaceTest.php:27-50` (owner enrolled, active session set) |
| Workspace switching/tenant scoping | VERIFIED | `MultiTenancyWorkspaceTest.php:52-258`; strict board scoping; caveat QA-010 |
| Invites | VERIFIED | `WorkspaceInvitationTest.php` (signed/expired/tampered, duplicate membership, force-reset) |
| Project/area creation | VERIFIED | `settings.projects.store`; `ArchitectureCleanupTest.php:80-88` permission denial; `AreaController` |
| Issue create/assign/move | VERIFIED | CRUD + `WorkRequestApiV1Test`, `WorkRequestAttributesTest`, `WorkRequestEmailTest` |
| Subtasks | VERIFIED | `SubtasksHierarchyTest.php` (depth cap, toggle, authz) |
| Dependencies | VERIFIED | `RequestDependenciesTest.php` (link/unlink auto-unblock); `EdgeCasesAndRaceConditionsTest.php:49-112` (cycle + cross-workspace rejection) |
| Cycle create/rollover | VERIFIED server-side | `CyclesEngineTest.php`; `CycleService.php:144-198` (row-locked, idempotent); scheduling missing QA-004 |
| Comments/notifications/mentions | VERIFIED | `NotificationTest`, `CommentMentionsAndCloneTest`, `ArchitectureCleanupTest.php:91-166` (mention bounds ≤10) |
| Uploads/downloads | PARTIAL | Image→WebP verified (`Request/Workspace/RequestWorkspaceTest.php:image upload processed to webp`); video path untested + QA-002; Docker durability QA-001 |
| PATs | PARTIAL | `PersonalAccessTokenTest.php` (6) passes; abilities unenforced QA-013 |
| Simultaneous users | NOT ASSESSED | No load harness; server-side row locks exist (`WorkRequestService.php:88`, `CycleService.php:148`) |
| Offline/reconnect | MISSING | No service worker/offline code (grep: 0 matches) |
| Concurrent edits | PARTIAL | Optimistic-lock 409 semantics verified (`OptimisticLockingTest.php`); multi-client UI conflict handling unverified (no JS tests) |

---

## 6. Performance (Scope C)

Measured, not invented:
- Board presentation: **54 queries for 50 rows** (QA-008) — dominant cost is per-card `loadCount`. Expected O(1) count queries.
- `EXPLAIN` for workspace board select: `type=ALL`, `Using filesort` on a tiny table (QA note: optimizer may ignore indexes at 50 rows; the `CASE`-based priority ordering (`WorkRequestController.php:48`) cannot use `requests(is_blocked,priority,updated_at)` regardless of size — ORDER BY is computed).
- Index inventory (migrations): `requests(status,priority)`, `(area_id,status)`, `(is_blocked,priority,updated_at)`, `(status,updated_at)`, `created_at`, `due_date`, FK index on `workspace_id`; `request_activities(request_id,created_at)`, `(type,created_at)`; `notifications(notifiable_type,notifiable_id,read_at)`; `request_relations` unique + reverse index; `workspace_user(workspace_id,user_id)` unique. Hot-path filtering is indexed; ordering/`LIKE` are not.
- Pagination: API v1 paginated `per_page ≤ 100` (`WorkRequestApiController.php:39-40`) — README claim holds. Web board windowed only (QA-009).
- Bundle: 2.0 MB client build; heaviest transferred chunks gzip: layout 185.6 kB, charts 108.0 kB, editor 100.9 kB (section 2 table). Vite emits >500 kB chunk warning. `AuthenticatedLayout` chunk is the main LCP risk; charts/editor are route/feature chunks.
- Test timings: full suite 17.4–19.2s; slowest observed test ~0.21s (image WebP pipeline) — no test-level performance regression detected.
- Search: unindexed `LIKE` (QA-019). Real-time fan-out, queue throughput, memory under load, reconnect: NOT ASSESSED (no load harness, no realtime transport). `memory_limit=256M` (`docker/php.ini:2`) + whole-file reads (QA-018) is the main memory risk found.

---

## 7. Docker / Installer / Doctor (Scope D)

- Dockerfile: 3-stage (node:20-alpine → composer:2 → php:8.3-fpm-alpine); non-root user created but not used by FPM (QA-001); extensions include pdo_mysql/pgsql/sqlite, redis, gd, zip, opcache, intl, pcntl, exif; ffmpeg apt-installed (`Dockerfile:53`); assets from stage 1 (`:82-83`); composer install with `--no-dev --no-scripts --ignore-platform-reqs` (`:25-31` — `--ignore-platform-reqs` can mask extension mismatches at build time). No `HEALTHCHECK`, no `USER`.
- Compose: prod-style single app container (Nginx+FPM+2 queue workers via supervisord) + MySQL 8.4 + Redis 7 + Mailpit; `restart: unless-stopped`; volumes for DB/Redis/storage. Missing: scheduler (QA-004), realtime broker (QA-012), app healthcheck (QA-028), secret defaults (QA-017), TLS/proxy (QA-016). `docker compose config` exit 0.
- Nginx: gzip, static caching, dotfile deny, `client_max_body_size 64M`, security headers incl. unconditional HSTS (QA-016). PHP-FPM socket via 127.0.0.1:9000.
- `relay:install`: 5-step wizard; idempotent `firstOrCreate` for permissions/roles/workspace; non-interactive defaults `--force`→ password `password` + force reset (QA-032); tested with `--skip-migrate` (`RelayCliCommandsTest.php:25-52`); NOT run against `stm` per policy.
- `relay:doctor`: ran; 23/1/0; checks PHP/extensions/DB/cache/dirs/manifest/key/debug. Mutations: healthcheck cache key (10s TTL), may create storage dirs. Gaps: no checks for scheduler wiring, queue worker liveness, Redis when not primary, APP_KEY persistence, or webhook secrets. CI ordering issue QA-007.

---

## 8. Ops / Reliability (Scope E)

| Area | Status | Evidence |
|---|---|---|
| Secure env defaults | PARTIAL | `.env.example` APP_ENV=local, APP_DEBUG=true, LOG_LEVEL=debug (expected for dev only); compose sets prod values but weak secret defaults (QA-017) |
| APP_KEY | BROKEN (default deploy) | QA-005 |
| HTTPS/proxy | PARTIAL | QA-016 |
| Sessions/cookies | PARTIAL | database/redis session store; `secure` unset; httpOnly/lax defaults OK (`config/session.php:173-203`) |
| Queue workers | PARTIAL | 2 workers, tries=3, timeout 90 (QA-002/020); no failed-job alerting (QA-015) |
| Scheduler | MISSING | QA-004 |
| Redis persistence | PARTIAL | `redis_data` volume only; RDB/AOF not configured (`docker-compose.yml:60-76`) |
| WebSocket proxy | MISSING | QA-012 |
| Email | PARTIAL | Mailpit SMTP in compose; log mailer by default; no delivery monitoring |
| Log rotation | PARTIAL | single channel grows unbounded; worker log rotates (QA-015) |
| Error tracking/alerting | MISSING | QA-015 |
| Monitoring | MISSING | QA-015 |
| DB/attachment backups | MISSING | QA-014 |
| Restore validation | MISSING | QA-014 |
| Migration safety | PARTIAL | `migrate --force --isolated` per boot; mostly reversible `down()`s; no backup-before-migrate runbook (QA-033) |
| Upgrade/rollback | MISSING | no docs (QA-033) |
| Zero-downtime | MISSING | single-node compose; boot-time migrate (QA-033) |
| Resource limits / disk exhaustion | MISSING | no compose limits; unbounded logs + storage volume growth |

---

## 9. Compatibility (Scope F)

- PHP: runtime verified 8.4.22 (tests/build/doctor all pass). Declared floors conflict: composer `^8.3`, doctor `>=8.2`, Docker 8.3, README badge 8.4 (QA-025).
- Laravel 13.33.0 verified with PHPUnit 13.3.4; CI matrix PHP 8.3/8.4.
- Node/React: Node 22.23 local, Node 20 in CI/Docker; React 19.3, Inertia React 3.7.1, Vite 8.3, TS 5.9 — build clean.
- DB engines: local MariaDB 12.3.2 (doctor PASS, 37 migrations) vs CI/compose MySQL 8.4 — MySQL 8.4 path unexercised locally. `config/database.php` supports sqlite/pgsql/sqlsrv; no migrations run against PG/SQLite here. `DatabasePortabilityTest` only forbids `FIELD()` syntax (3 tests); it does not prove PG/SQLite compatibility (e.g., raw `CASE`, `DATE()` aggregation in `DashboardService.php:72,81`, JSON path `metadata->to` in `:80` — MySQL/MariaDB-valid, PG/SQLite behavior unverified). Treat PostgreSQL/SQLite as UNVERIFIED.
- Local vs prod drift: local uses database cache/queue/session + log mailer; compose uses redis + smtp; tests use array/sync — behavior differences are only covered by tests for the test config.
- Clean install from fresh checkout: NOT ASSESSED (no `composer install`/`npm ci` from zero run).

---

## 10. 35-Feature Status

| # | Feature | Status | Basis |
|---|---------|--------|-------|
| 1 | CRUD/IDs | VERIFIED | API + web tests |
| 2 | Kanban | VERIFIED (server) / UNVERIFIED (UI) | tests; QA-009 cap, no JS tests |
| 3 | List | VERIFIED | priority-order test, presenter |
| 4 | Optimistic | IMPLEMENTED/UNVERIFIED | `useKanbanBoard`; no JS tests |
| 5 | Story points | VERIFIED | `StoryPointsTest` (4) |
| 6 | Subtasks | VERIFIED | `SubtasksHierarchyTest` (6) |
| 7 | Dependencies | VERIFIED | `RequestDependenciesTest` (3) |
| 8 | Auto-unblock | VERIFIED | `WorkRequestService.php:309-353` + test |
| 9 | Tags/priority/due | VERIFIED | `WorkRequestAttributesTest` (4) |
| 10 | Cycles | VERIFIED | `CyclesEngineTest` (5) |
| 11 | Auto rollover | PARTIAL | command only; no schedule (QA-004) |
| 12 | Velocity/burndown | VERIFIED | `DashboardService` + exact-count test; `CycleService::getBurndown` |
| 13 | Roadmap/Gantt | VERIFIED | `RoadmapViewTest` (4) |
| 14 | Palette | IMPLEMENTED/UNVERIFIED | `CommandPalette.tsx`; no JS tests |
| 15 | Keyboard | IMPLEMENTED/UNVERIFIED | shortcuts/modal; no JS tests |
| 16 | Locking/conflict | VERIFIED (server) / UNVERIFIED (UI) | `OptimisticLockingTest` 409; row locks |
| 17 | Undo | IMPLEMENTED/UNVERIFIED | server rollback test; toast undo unverified |
| 18 | Markdown | IMPLEMENTED/UNVERIFIED | `TipTapEditor.tsx`; no tests |
| 19 | Presence | PARTIAL/MISSING runtime | QA-012 |
| 20 | Mentions/notifications | VERIFIED | mentions/notification/email tests |
| 21 | Files | PARTIAL | image VERIFIED; video untested + QA-002; Docker QA-001 |
| 22 | API | VERIFIED (with QA-030) | `WorkRequestApiV1Test` (10) |
| 23 | PATs | PARTIAL | QA-013 |
| 24 | Inbound email | VERIFIED (with QA-011) | `InboundEmailWebhookTest` (5) |
| 25 | GitHub | VERIFIED (with QA-003) | `GitHubPullRequestSyncTest` (4) + export test |
| 26 | Slack/Discord | PARTIAL | Discord tests (4) + service; native Slack absent (generic webhook only, `.env` slack keys unused for product feature) |
| 27 | Exports | VERIFIED | `ExportAndIntegrationTest` CSV/JSON streamed |
| 28 | Tenant isolation | VERIFIED (with QA-010) | `MultiTenancyWorkspaceTest` (7), edge cases |
| 29 | Invites/roles | VERIFIED | `WorkspaceInvitationTest` (10), authz tests |
| 30 | Audit | VERIFIED | `WorkspaceAuditTest` (2), `AuditService` |
| 31 | 2FA | VERIFIED (with QA-005 deployment risk) | `TwoFactorAndOAuthTest` (9) |
| 32 | OAuth | VERIFIED | same file + `OAuthProviderToggleTest` (9) |
| 33 | Docker | IMPLEMENTED/UNVERIFIED | `compose config` OK; QA-001/002/005 runtime statics; no build/up run |
| 34 | Installer | VERIFIED (test path) | `RelayCliCommandsTest` (skip-migrate); not run against real DB |
| 35 | Doctor | VERIFIED (23/1/0) | run; CI ordering QA-007 |

---

## 11. Blockers & Prioritized Fixes

Production blockers (must fix before deploy):
1. QA-001 storage permissions (uploads/logs/views) — S
2. QA-002 video worker timeout — S
3. QA-003 GitHub webhook fail-open — S
4. QA-004 cycle rollover scheduler — S
5. QA-005 APP_KEY persistence — S
6. QA-006 pint failure (CI red) — XS
7. QA-007 CI doctor-before-migrate — XS
8. QA-017 secret defaults / Redis exposure — S
9. QA-014 backups + restore drill — M

Strongly recommended (P2): QA-008 N+1 (S), QA-009 board pagination (M), QA-010 null-workspace scoping (S), QA-011 inbound webhook auth+throttle (M), QA-012 realtime decision (L or descope), QA-013 PAT abilities (S), QA-015 logging/alerting (M), QA-016 proxy/TLS (S), QA-018 upload limits/memory (S), QA-019 search scale (M), QA-020 retry_after (XS), QA-021 frontend tests (M), QA-030 API permission parity (S).

Order of execution suggestion: QA-006/007 (CI green) → QA-001/002/005/017 (deploy-safe container) → QA-003/004/011 (unauthenticated entry points) → QA-008/009 (scale) → QA-014/015/016 (ops) → QA-021 coverage.

---

## 12. Verification Trail (selected raw outputs)

- `pint`: `{"tool":"pint","result":"fail","files":[...5 files...]}` (full list in section 2 row 6).
- `tsc`: empty output, exit 0.
- `eslint`: `✖ 75 problems (0 errors, 75 warnings)`.
- `build`: `✓ 3318 modules transformed.` / `✓ built in 623ms` / SSR `✓ built in 42ms`; `(!) Some chunks are larger than 500 kB after minification.`
- `composer audit`: `No security vulnerability advisories found.`
- `npm audit`: `3 vulnerabilities (1 moderate, 2 high)`.
- `relay:doctor`: `Diagnostics Summary: 23 passed, 1 warnings, 0 failures` (WARN = `Redis test skipped: Connection refused`).
- Query probe: `board_rows=50 queries=54 elapsed_ms=23`; `EXPLAIN ... type=ALL ... Using filesort`.
- `php artisan test`: `Tests: 195 passed (1055 assertions)` twice; `git status --porcelain` → `?? reports/` only.

Redaction: no secret values from `.env`/compose interpolation are reproduced in this report (APP_KEY, DB passwords redacted).
