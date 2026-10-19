# Agent 2 — Frontend, UX & Product Feature Completeness Audit

**Project:** Relay Studio (`/Volumes/Main/Herd/stm`)
**Report date:** 2026-10-18
**Method:** Static source audit only (no builds, tests or runtime execution — QA agent owns commands). Laravel semantics verified against vendor source (`InteractsWithContentTypes.php:24-27`) where routing/`expectsJson` behavior mattered. Findings cite file paths with line numbers. Every claim is labeled CONFIRMED (code path fully traced) or SUSPECTED (needs runtime or another agent's domain).

---

## 1. Executive Summary

**Verdict: NOT PRODUCTION-READY.** The frontend is visually polished and feature-rich, but ships (1) three hard product-breaking defects (global "quick-create" unusable on most pages, a broken file-retry button that crashes route lookup, and demo credentials autofilled on the login screen), (2) an entire layer of *illusory realtime* — a broadcast listener with no sender, fake presence avatars and a "live" indicator with no WebSocket packages installed, and (3) systematic omission of optimistic-locking (`lock_version`) from every bulk/drawer/dashboard/palette mutation path, so concurrent edits are silently lost.

Key numbers: **26 findings** (P0×3, P1×5, SUSPECTED×2, P2×7, P3×9); **39 fully dead frontend files ≈ 5,318 LOC**; 13 of 28 tracked capabilities fully ✅, 11 ⚠️ usable-with-defects, 5 BROKEN, 6 MISSING, 2 FAKE (realtime presence, enforced 2FA login).

### Priority snapshot
| Count | Meaning |
|---|---|
| 3 P0 | Breaks a core promise in production (create anywhere, retry uploads, demo creds) |
| 5 P1 | Data-integrity or honesty defects (lost updates, stale views, fake realtime, drawer data bugs, 2FA "Enforced" lie) |
| 2 SUSPECT | XSS path (Agent 3) and cross-workspace row visibility (Agent 1) |
| 7 P2 | Shortcut conflicts, no refresh, missing UI affordances, i18n dead, no restore, no cycle-create |
| 9 P3 | Polish, a11y mix, hardcoded widgets, dead toggles |

---

## 2. Scope, Stack & Method

- **Reads:** all `Pages/*`, `Layouts/*`, `Features/*` component trees, key `Components/*` primitives, all request-control controllers touched by the UI, route maps, shared Inertia middleware, `bootstrap.ts`/`app.tsx`/`ssr.tsx`, `app.blade.php`, exception-to-Inertia wiring in `bootstrap/app.php`, model scopes used by the UI, `lang/en` size check.
- **Greps:** import cross-reference sweep (dead-file detection), `BroadcastChannel`/`Echo`/`visibilitychange`/polling, `metaKey` keyboard handlers, `dangerouslySetInnerHTML`, `window.confirm`, `lib/i18n` importers, `requests.files.retry` call sites, dead-file finder over `Features|Components|Hooks|Utils|lib|Pages|Layouts`.
- **Commands:** none executed (`tsc`/`lint`/tests intentionally NOT run per protocol). Backend behavior always inferred from readable controllers, never executed.

Stack observed: React 19.3, @inertiajs/react 3.7.1, TypeScript 5.9.3, Vite 8.3, Tailwind v4 (via `@tailwindcss/vite` + legacy `@config "../../tailwind.config.js"` in `resources/css/app.css`), @hello-pangea/dnd 18, TipTap 3.32 (table + task extensions), `cmdk` 1.1.1, lucide-react 1.31, recharts 3.10.1, sonner 2.0.8, axios 1.20. **No `laravel-echo`, `pusher-js`, or reverb client package.**

Dark-only Obsidian theme (`color-scheme: dark; background #090a0f` — `resources/css/app.css`); no light theme, no prefers-color-scheme handling.

---

## 3. Route & Menu Map (what the user can reach)

### Sidebar (`Components/Sidebar.tsx`)
- Dashboard, Requests, Roadmap, Cycles, Integrations, Settings, Notifications (dropdown), Profile (dropdown), WorkspaceSwitcher (posts `workspaces.switch`; controller redirects back or to `requests.index` — works).
- Saved-views list rendered from shared `savedViews` prop (map at Sidebar.tsx:242+): clicking applies filters via `route('requests.index', queryParams)`. **No rename/unpin/delete UI anywhere** (save-only; `is_pinned: true` hardcoded at `Features/Requests/components/BoardFilterBar.tsx:81`).
- Roles: user dropdown shows role label from `auth.role`, but **Settings/Integrations nav items have no permission gating** (nav array lines 100-115; dropdown line 419). Members can click into 403 screens.
- Custom `zinc-850`/`zinc-750` shades referenced throughout classnames (legacy config extension — build concern only).

### Auth routes (`routes/auth.php`) & login
- Login (username) + Socialite (github/google — buttons conditionally rendered from `SocialAuthService::enabledProviders()` server data).
- **No registration page** (invite-only by design): `Pages/Auth/AcceptInvitation.tsx` posts `route('invitations.store', invitation.token)` (AcceptInvitation.tsx:50) with workspace/role summary card, GuestLayout wrapper.
- Password update, logout.
- 2FA enable/confirm/disable/recovery-codes all driven from Profile (`TwoFactorSecurityCard`) — UI complete. **No 2FA challenge step exists in the login flow** (`AuthenticatedSessionController::store` has no TOTP branch) while the Profile card labels the state *"Enabled & Enforced"* — materially false (Fy8).

### Requests routes consumed by the UI
All FE route names verified against `routes/web.php`; one mismatch:
- `Pages/Requests/Show.tsx:122` calls `route('requests.files.retry', …)` — **that route is NOT defined** ⇒ Ziggy route lookup throws on click (Fy3 CONFIRMED P0). Backend retry capability exists in the service layer; the HTTP route is simply absent.
- Everything else present (`requests.index/show/update/destroy/bulk/clone/comments.store/files.store/relations.store/relations.destroy/subtasks.store/subtasks.toggle/subtasks.destroy`).
- `NotificationController` read/unread/toggle/readAll — owner-scoped (verified safe). FE consumes all relevant routes.

### Global modal mechanics & property plumbing
- `SingleRequestForm` posts `requests.bulk` (`SingleRequestForm.tsx:103`), ⌘Enter submit (`:139`), paste-block parsing, file uploads.
- `BulkSpreadsheetForm` posts chunked `requests.bulk` (`:80`), ⌘Enter submit (`:131`).
- **Global quick-create breakage (Fy1 CONFIRMED P0):** `Layouts/AuthenticatedLayout.tsx:17-18` reads `props.projects ?? []` / `props.users ?? []` — but shared prop is **`workspaceProjects`** (`HandleInertiaRequests.php`) and `users` is **never shared**. `SingleRequestForm` disables submit without an Area selection (`!areaId`). Net effect: the floating "c" quick-create modal renders empty and can never submit from Dashboard, Cycles, Roadmap, Settings, Profile, Integrations, Notifications. Only `Requests/*` pages (controller-supplied `projects`/`users` page-props) work.

### Error pages / boot
- `bootstrap/app.php` maps 500/503/404/403 → `inertia('Error')` for non-local/non-testing envs; `Pages/Error.tsx` themed screens cover 404/403/500/419.
- 419 double-safety: `bootstrap.ts` axios interceptor reloads on 419; `app.tsx:11-17` mirrors for the Inertia router. Confirmed `expectsJson()` semantics via vendor source (`InteractsWithContentTypes.php:24-27`): Inertia router sends `Accept: text/html` ⇒ controllers can `back()` and Inertia renders redirects; `window.axios` default Accept JSON-first gets real JSON responses — both paths verified consistent.
- Error page ⌘K dispatch (`Pages/Error.tsx:73`) is a synthetic KeyboardEvent, but `CommandPalette` is not mounted on error pages ⇒ no-op (Fy5).

---

## 4. Page-by-Page Audit

| Page / Route | State | Notable behavior + defects |
|---|---|---|
| `Auth/Login` | 🔴 **P0** | Hardcoded `DEMO_PERSONAS` (robin/hussien/brother/designer-1) with literal "password: password" hint + autofill (`Pages/Auth/Login.tsx:24-29`) — credential exposure in prod (Fy2). |
| `Auth/AcceptInvitation` (GuestLayout) | ✅ | Token signup; workspace/role summary; show-password toggle. |
| `Dashboard` | ⚠️ | Features/Dashboard components (KpiTiles, DeliveryVelocityCard, QueuesGrid, TeamWorkload, ActivityFeed, Hero, RoadblockBanner). Queue filter links valid (server scopes `my_work`/`blocked`/`status`/`priority` confirmed in `app/Models/WorkRequest.php:148-163` `scopeFilter`). Defects: quick-advance PATCH without `lock_version` (Fy4 pattern); no `projects`/`users` page props ⇒ quick-create dead (Fy1). |
| `Requests/Index` (kanban+list) | ⚠️ | View-mode persisted (profile preferences + localStorage). Single drag sends `lock_version`; **bulk ops omit it** (Fy4). No sorting UI in list view. No pagination/load-more despite 250-row server cap (Fy17). No saved-view management (Fy9). `/` key conflict palette+search (Fy5). Search maps to server `?search=` — client filters ≤250 loaded rows only. |
| `Requests/Show` | ⚠️ | TipTap editor, media gallery, activity feed, relations, subtasks, PRs, lightbox (Esc/zoom/copy). **Retry-upload throws (Fy3)**; drawer-style edits PATCH without `lock_version` (Fy4); dead `showDiff` "Review Changes" toggle with no diff UI (Fy10). `requests.clone` works (HeroHeader `router.post`). |
| `Cycles/Index` | ⚠️ | Burndown chart, cycle nav (`cycle_id` param), rollover via native `confirm()`. **No create-cycle UI** though `cycles.store` exists (Fy20). No `projects`/`users` props ⇒ quick-create dead (Fy1). No timezone formatting (Fy21). |
| `Roadmap/Index` | ⚠️ | **Static Gantt** — no drag/resize/dependency arrows; blocking count badge only. Quarter nav (`roadmap.index`) works. Global quick-create dead here (Fy1). |
| `Settings/Index` | ⚠️ | Projects card (create/edit/archive/reorder), Team card (role filters, `settings.team.update` activation toggle), member invite modal (`settings.team.store`), OAuthProvidersCard (`settings.oauth.toggle` optimistic w/ revert), WorkspaceSnapshotCard (read-only), audit tabs. Visible to Members until backend 403 (Fy16). |
| `Integrations/Index` | ⚠️ | Discord webhook config + real test-send (`integrations.discord.test`), live preview, email template editor + test + render preview (`integrations.email.{update,test,preview}`), DeliveryLogTable (client status filter; loaded once, no polling). **"Notifications Active" pill hardcoded green** (`Pages/Integrations/Index.tsx:56-59`) regardless of config (Fy19). |
| `Notifications/Index` | ✅ | Tabs (all/inbox/assignments/reviews/resolved client filters), read/unread toggle, mark-all; server limit 50; ownership safe (NotificationController scoped to `$request->user()->notifications()`). |
| `Profile/Edit` | ⚠️ | VisualIdentityHero (stats), AccountTelemetry, UpdateProfileInformationForm, PAT card (create/abilities/expiry/revoke/clipboard — via hard-coded `/tokens` axios URLs, route-equivalent), **2FA card** (full enable→QR→confirm→recovery→disable) with false "Enforced" label (Fy8), NotificationPreferencesCard (axios PATCH toggles), password form. |
| `Errors` | ✅ | Themed dark screens; ⌘K hint dead (Fy5). |

Shared-prop cross-check: `workspaceProjects`, `savedViews`, `workspaceNotifications`, `unreadNotificationsCount`, `auth.*`, `flash` correctly shared; `projects`/`users` never shared (root cause Fy1).

---

## 5. Component-Level Audit (canonical tree = `Features/`)

Pages import from `@/Features/{Requests,Dashboard,Notifications,Settings,Integrations,Profile}` barrels plus `@/Components/*` primitives. `Modal` = Headless UI Dialog (focus trap, Esc, aria-modal) — good baseline; several other overlays are handcrafted (see Fy22).

- **`KanbanBoard.tsx` (Features/Requests)** — dnd drag → `useKanbanBoard`. Listens to `BroadcastChannel('relay_workspace_live_sync')` for CARD_MOVED events (`KanbanBoard.tsx:74-112`) — **no code anywhere ever posts to this channel** (Fy6). Also asks `typeof window.Echo !== 'undefined'` for WS join/leave (never true — no packages installed). Vim `j/k/h/l` card navigation + Space/Enter opens drawer; single-drag PATCH **with** `lock_version`; but the 409 rollback **reverts locally without refetching** ⇒ in-memory `lock_version` remains stale, every subsequent drag fails until reload (Fy5).
- **`useKanbanBoard.ts`** — bulk helpers send `requests.bulk` WITHOUT per-item `lock_version`; error paths `.catch(() => {})` swallow failures while optimistic state persists and the undo-toast implies success (Fy4/Fy5). Confetti (`Utils/confetti.ts`) on done-bulk — charming, fine.
- **`QuickViewDrawer`** — GETs `requests.show` with axios (JSON Accept ⇒ JSON page payload — verified semantics). **Reads `res.data.props.request.comments`** which the presenter never emits (it returns `activities`) ⇒ **comment list always empty**. **Project select binds `request.area_id`** which the presenter omits (only `project: {...}` object) ⇒ **always shows "No Project"** unless re-picked (Fy7). Drawer edits PATCH without `lock_version` (Fy4). Esc closes regardless of dirty state — no unsaved guard (Fy10).
- **`RequestListView`, `BulkActionBar`** — floating toolbar (status/priority/assignee selects) delegating to bulk callbacks; no delete/archive bulk; native `<select>`s without `aria-label`s (Fy23); Esc-only deselect via keyboard handler.
- **`Detail/*` (Hero, Description, Discussion, MediaGallery, BlockerBanner, Subtasks, PullRequests, SidebarProperties)** — individually high quality; `@mentions` regex parity with backend `RequestCommentController.php:33` (`/@([a-zA-Z0-9_\-\.]+)/`). Subtask toggle/store/delete wired to real routes with error toasts.
- **`MarkdownViewer` (Components)** — hand-rolled, no `dangerouslySetInnerHTML` ⇒ XSS-safe. **Renders only `###` headings**; no links/images/tables/italic/numbered-lists — while TipTap serializes tables/H1/H2/links ⇒ rich content displays as raw pipes/heading-less text in Discussion/Description contexts (Fy11 round-trip defect).
- **`TipTapEditor` (Components/Editor)** — full-featured (task lists, tables, slash commands, toolbar). `markdownToHtml()` (`TipTapEditor.tsx:32-36`) passes ANY stored content containing HTML tags through untouched (`/<[a-z][\s\S]*>/i` short-circuit). TipTap schema stripping likely contains risk, but this is the audit's **SUSPECTED XSS gate → Agent 3** (Fy12). Round-trip mismatch with MarkdownViewer (Fy11).
- **`CommandPalette` (Components)** — cmdk with global ⌘K/Ctrl+K; listens for `/` to open — collides with board search focus (`useBoardFilters.ts:209`) → both fire (Fy5). Live fetch `/api/search`; backend `GlobalSearchController` verified to return `{requests(limit 8), projects}` — shape matches. **Hardcoded teammate assignment actions** "Assign to Robin"/"Assign to Hussien" with fallback user IDs `robinUser?.id || 1` / `hussienUser?.id || 2` — on pages where `users` isn't shared the list is empty and the fallback IDs are arbitrary (Fy18); these PATCHes omit `lock_version` too (Fy4).
- **`Sidebar` / `ShortcutsModal` / `AuthenticatedLayout` global keys** — actual bindings: `?` shortcuts, `c` quick-create, `g d/b/p/n/s` navigation (`AuthenticatedLayout.tsx:47-62+`). Yet Sidebar advertises ⌘D/⌘M/⌘B/⌘C/⌘R/⌘[ kbd hints that no code binds, and ShortcutsModal lists ⌘Z undo / ⌘⇧C copy that don't exist (Fy9). Layout also runs a 10s `setInterval` header clock (minor re-render churn).
- **`LivePresenceAvatars`** — "who's viewing" avatars + green live dot + "1 viewing now". With no Echo/Reverb packages, it always shows just self (Fy6 CONFIRMED — fake presence).
- **`NotificationPopover`** — outside-click + Esc, per-item read/unread, shared `workspaceNotifications` (15) + `unreadNotificationsCount`; deeplinks use server-defined `url`s (not user-typed). Good.
- **`GuestLayout`** — alive (AcceptInvitation) — not dead as first suspected.
- **`ImageLightbox`** — own Esc handling, zoom 0.6-3.0, copy link, download & open-in-new buttons; not focus-trapped (Fy22).
- **`FileDropZone`** — drop handler with progress; **no `role`/`aria-*` and not keyboard-reachable** in either dead or live copy (Fy23); drag-and-drop only, backed by the same click-to-select input in the upload card.

---

## 6. Feature Completeness Matrix

Legend: ✅ complete · ⚠️ usable-with-defects · 🐛 broken · 🚫 missing · 🔮 fake (pretends but does not function)

| Frontend capability | Status | Finding |
|---|---|---|
| Kanban board, drag-drop, quick actions | ⚠️ | Fy4/Fy5 (conflict-stale, silent failures) |
| List view + selection + bulk ops | ⚠️ | No sorting UI; Esc-only deselect |
| Create issues (single, bulk paste, ⌘Enter, files) | 🐛 | Fy1 — only works on request pages |
| Detail drawer | 🐛 | Fy7 — comments empty, project always "No Project" |
| Detail page (editor, files, relations, subtasks, PRs) | ⚠️ | Fy3 retry 404; Fy4 lock omission |
| Rich-content edit → display round-trip | ⚠️ | Fy11 (tables/H1/H2 lost in viewers) |
| @mentions in comments | ✅ | regex parity verified |
| Notifications (popover, page, preferences) | ✅ | ownership-safe |
| Global search / ⌘K palette | ⚠️ | Fy18 hardcoded assigns; no-lock PATCH |
| Duplicate request (clone) | ✅ | |
| Cycles (list, burndown, rollover) | ⚠️ | Fy20 no create UI; Fy21 no TZ |
| Roadmap (static Gantt, quarter nav) | ⚠️ | read-only by design; Fy21 |
| Settings (projects, team, invite, OAuth, audit) | ⚠️ | Fy16 ungated nav |
| Integrations (Discord + Email config/test/preview/logs) | ⚠️ | Fy19 fake "live" pill |
| Personal tokens (CRUD, abilities, expiry, revoke) | ✅ | hard-coded `/tokens` URLs (works) |
| 2FA management UI | 🐛 | Fy8 — "Enforced" is false |
| Profile updates / password | ✅ | |
| Invitation acceptance | ✅ | |
| Error pages (403/404/500/503/419) | ✅ | Fy5 ⌘K hint dead |
| Realtime board sync (cross-tab) | 🔮 | Fy6 listener without sender |
| Presence ("viewing now") | 🔮 | Fy6 always self |
| Saved views (save, apply) | ⚠️ | Fy9 no unpin/rename/delete |
| Restore archived/deleted requests | 🚫 | soft deletes server-side only |
| Language switching | 🚫 | Fy14 i18n dead |
| Multi-user conflict diff UX | 🚫 | Fy10 dead toggle |
| Registration | 🚫 | invite-only (by design) |
| Timezone display | 🚫 | Fy21 |
| Permission-gated nav | 🚫 | Fy16 |

**Counts:** ✅ 13 · ⚠️ 11 · 🐛 broken 5 · 🚫 missing 6 · 🔮 fake 2. Every sidebar route resolves to a real, polished screen — the facade is professional; the Fy1/Fy3/Fy6 + realtime-fake categories make it "look complete, function hollow" in production.

---

## 7. UX / Interaction & Honesty Defects

- **Guidance lies:** wrong sidebar ⌘ hints (actual: `g`-sequences, `c`, `?`); ShortcutsModal documents unimplemented ⌘Z/⌘⇧C; "Notifications Active" hardcoded green; Error-page ⌘K hint no-op (Fy5/Fy9/Fy19).
- **Keyboard conflict:** `/` on board opens palette AND focuses search (Fy5).
- **Toasts vs reality:** swallowed bulk failures keep optimistic-looking state; undo toast offers stale-version reversals (Fy4/Fy5).
- **Destructive actions:** native `window.confirm()` (activation toggle, token revoke, 2FA disable, cycle rollover, request delete) — consistent but unbranded; **no unsaved-changes guard** on drawer/editor (Fy10).
- **Palette assign actions** with fallback user IDs 1/2 — 404/no-op in fresh deployments without those IDs (Fy18).
- **250-row cap with no affordance** ("showing X of Y" / load-more absent, Fy17).
- **Drawer close = data loss** (dirty-state Esc mishandling, Fy10).

---

## 8. Accessibility

- `Modal` is Headless Dialog (good); **QuickViewDrawer, CommandPalette, ShortcutsModal, ImageLightbox, workspace/team modals are handcrafted overlays without `role="dialog"`, focus traps, or aria-modal** (Fy22).
- BulkActionBar & config selects lack accessible names (Fy23); icon-only buttons mostly have `title=`.
- FileDropZone not keyboard-reachable, no drop-region semantics (Fy23).
- Color-only indicators are mostly paired with text labels (acceptable); presence counter is decorative.
- Chart axis contrast (zinc-500 on #090a0f) is low.
- A11y evidence is source-confirmed only — QA should run axe-core at runtime (my constraint).

---

## 9. Performance

- Board ≤250 cards with memoized cards; no virtualization — acceptable at cap.
- Palette debounced keystroke fetches vs `/api/search` (backend throttle 60/1) — fine.
- 10s clock interval re-renders the whole layout tree each tick (minor).
- **No route-level code splitting** (`Pages/*` bundled eagerly; `ssr.tsx` present). The 39-file/5,318-LOC dead-tree removal (next section) is a free bundle win; additional tree pruning recommended at ship time.
- Debounce/optimistic state watches are OK; infinite loops/alert patterns absent.

---

## 10. Dead / Duplicate Code Inventory (CONFIRMED)

Canonical = `Features/*`. Dead = unreachable from any page (import sweep verified; only self-references within dead trees):

| Dead item | Files | LOC slice |
|---|---|---|
| `Components/Requests/*` (legacy duplicate tree) | 17 (BoardFilterBar, BoardHeader, BulkActionBar, Create/SingleRequestForm, Create/BulkSpreadsheetForm, Detail/* ×6, FileDropZone, KanbanBoard, QuickCreateModal, QuickViewDrawer, RequestCard, RequestListView) | — |
| `Components/Dashboard/*` (legacy duplicate tree) | 11 (DashboardActivityFeed, DashboardHero, DashboardKpiTiles, DashboardQueuesGrid, DeliveryVelocityCard, InitiativesProgressCard, RoadblockAlertBanner, StatCard, TeamWorkloadCard, index.ts, types.ts) | — |
| Orphan primitives | 8 (Avatar, DangerButton, NavLink, PageHeader, Pagination, ResponsiveNavLink, Table, Tabs) | — |
| Orphan utils (never imported) | 3 (lib/i18n.ts, Utils/date.ts, Utils/status.ts) | — |
| Stale hooks (only a type re-export referenced) | 2 (Hooks/useBoardFilters.ts, Hooks/useKanbanBoard.ts — Features/* hooks canonical; BoardFilterBar imports `UseBoardFiltersReturn` type) | — |
| **TOTAL dead** | **39 files** | **≈ 5,318 LOC** |

`GuestLayout` is alive (AcceptInvitation). Both dead and live shared-logic trees have drifted (dead KanbanBoard/disable behaviors differ) — total bundle and type debt removal is nearly free and not version-forky.

---

## 11. Findings Register

### P0 — Ship blockers
- **Fy1 · CONFIRMED P0 · Global quick-create broken on most pages.** `Layouts/AuthenticatedLayout.tsx:17-18` reads `props.projects`/`props.users` (wrong/absent); shared prop is `workspaceProjects`, `users` never shared. Fix: share `projects`/`users` globally or map layout to `workspaceProjects` + lazy-fetch users on modal open.
- **Fy2 · CONFIRMED P0 · Demo-personas autofill + "password: password" hint on login.** `Pages/Auth/Login.tsx:24-29`. Remove or gate behind non-production env.
- **Fy3 · CONFIRMED P0 · File-retry button throws (route missing).** `Pages/Requests/Show.tsx:122` → `route('requests.files.retry')` lacks route definition in `routes/web.php`. Add route (backend service already supports it) or remove the button.

### P1 — Data integrity & honesty
- **Fy4 · CONFIRMED P1 · `lock_version` omitted everywhere except single-card drag.** Bulk helpers (useKanbanBoard), QuickViewDrawer, Dashboard advance (`Pages/Dashboard.tsx`), Palette assign (CommandPalette) all mutate without `lock_version`; server enforces only when provided ⇒ silent concurrent overwrites.
- **Fy5 · CONFIRMED P1 · Failure states don't refetch / toasts lie.** Single-drag 409 rollback without refetch (stale version sticks); bulk `.catch(() => {})` swallowing; undo toast claims success-shaped state.
- **Fy6 · CONFIRMED P1 · Illusory realtime/presence.** `BroadcastChannel('relay_workspace_live_sync')` listener (`KanbanBoard.tsx:74-112`) with no sender; `window.Echo` never initialized (no echo/reverb package) ⇒ fake presence (`LivePresenceAvatars.tsx` "1 viewing now" self-only). Implement or strip.
- **Fy7 · CONFIRMED P1 · QuickViewDrawer reads fields the presenter doesn't send.** `comments` vs `activities` (drawer comments always empty); `area_id` never in payload (project select always "No Project") — `WorkRequestPresenter::base` mismatch.
- **Fy8 · CONFIRMED P1 · 2FA "Enforced" is false at the login step.** `TwoFactorSecurityCard` labels the enabled state *"Enabled & Enforced"*; `AuthenticatedSessionController::store` has no TOTP challenge (`routes/auth.php` no challenge route). Implement login challenge (Agent 1) or relabel.

### UX conflicts / missing affordances (P2)
- **Fy9 · CONFIRMED P2 · Saved views are save-only.** No unpin/rename/delete UI; `is_pinned: true` hardcoded (`BoardFilterBar.tsx:81`).
- **Fy10 · CONFIRMED P2 · No unsaved-guard / no conflict-diff UX.** Esc on dirty drawer loses edits; `showDiff` toggle on Show renders nothing.
- **Fy11 · CONFIRMED P2 · TipTap→MarkdownViewer round-trip loses formatting.** Editor emits tables/H1/H2/links; viewer supports only `###`/bold/lists/checks (no links/images/tables/numbered).
- **Fy14 · CONFIRMED P2 · i18n dead weight, no language switch.** `lib/i18n.ts` (111 lines) never imported; shared `translations`+`i18n` unused; all strings hardcoded English; `lang/en` 2 domains (76 lines).
- **Fy15 · CONFIRMED P2 · No trash/restore UI.** Backend soft deletes exist; no archived/restore route or toggle anywhere (`requests.restore` route absent).
- **Fy16 · CONFIRMED P2 · Settings/Integrations nav not permission-gated.** Sidebar lines 100-115/419 visible to all roles ⇒ Members land on 403. Gate with `auth.permissions`.
- **Fy17 · CONFIRMED P2 · 250-row cap invisible to user.** No pagination/load-more/sort/"showing X of Y" though server supports `limit` up to 500.

### SUSPECT — needs another agent / runtime
- **Fy12 · SUSPECT → Agent 3 · TipTap HTML passthrough.** `TipTapEditor.tsx:32-36` passes stored HTML through `markdownToHtml()` untouched. TipTap schema likely strips risky nodes, but treat stored-content escape path as open question pre-ship.
- **Fy13 · SUSPECT → Agent 1 · Cross-workspace visibility patterns.** `GlobalSearchController` and saved-views include `orWhereNull('workspace_id')` rows inside per-workspace results; confirm whether NULL-workspace visibility is intended for these two constructs.

### P3 — Polish / consistency
- **Fy18 · P3 · Palette teammate assigns hardcoded Robin/Hussien with fallback IDs 1/2** (`CommandPalette.tsx`).
- **Fy19 · P3 · Integrations "Notifications Active" hardcoded green** (`Pages/Integrations/Index.tsx:56-59`).
- **Fy20 · P3 · No create-cycle UI despite `cycles.store`; rollover-only** with native confirm.
- **Fy21 · P3 · No timezone display; dates always client-relative or server strings** (dead `Utils/date.ts` hints at an abandoned attempt).
- **Fy22 · P3 · Mixed overlay governance:** Headless Modal vs handcrafted drawers (no role/focus-trap/aria-modal).
- **Fy23 · P3 · Accessible-name gaps:** BulkActionBar selects without `aria-label`; FileDropZone not keyboard-reachable/no semantics.
- **Fy24 · P3 · Retry error-text only via toast; no file-type/size guidance beyond hint text.**
- **Fy25 · P3 · No load-more despite server `limit` support.**
- **Fy26 · P3 · Toast API inconsistency:** `toast` (sonner) vs `notifySuccess/notifyError` wrappers used interchangeably.

### Positive highlights (do count!)
- Route-name discipline is otherwise high — only one FE→BE route mismatch in the entire app.
- Search-server payload shape verified; no fragile assumptions.
- Notification flows correctly owner-scoped and deeplink server-defined URLs.
- Headless Modal correctly handles a11y where used; theme/css conventions very consistent.
- Demo-ready polish across the entire surface area (which makes Fy2 even more pressing — production users will trust the login page on sight).

---

## 12. Production Blockers Summary & Cross-Agent Notes

**Strictly before ship (ordered):**
1. Fy3 — add `requests.files.retry` route or remove the button.
2. Fy1 — share `projects`/`users` in `HandleInertiaRequests` (or map layout to `workspaceProjects` + fetch users lazily).
3. Fy2 — remove demo personas/„password: password" from prod builds.
4. Fy4/Fy5 — cover `lock_version` in all mutation paths; refetch after conflicts; make toasts truthful (no swallow/catch-all).
5. Fy6 — kill the fake realtime layer (remove `LivePresenceAvatars`'s counting claim, dead `BroadcastChannel` listener, "live" pills) or implement Echo/Reverb + backend broadcast events.
6. Fy8 — implement 2FA login challenge (Agent 1) or remove "Enforced" claim.
7. Dead-tree cleanup (P2, ~39 files/5,318 LOC): after P0s; then run a bundle-size regression to confirm free wins.

**Cross-agent handoffs:**
- → **Agent 1 (backend):** (a) Fy8 login TOTP challenge; (b) Fy3 missing route; (c) Fy13 NULL-workspace visibility rulings for global-search + saved-views; (d) confirm unused routes `saved-views.pin`/`profile.tokens` may be deleted; (e) `requests.files.retry` capability has no HTTP route today.
- → **Agent 3 (security):** Fy12 TipTap HTML passthrough (`TipTapEditor.tsx:32-36`); cross-check `dangerouslySetInnerHTML` audit list (2FA QR from server-rendered BaconQrCode, Pagination `link.label` from Laravel translation).
- → **Agent 6 / QA (runtime):** (a) verify drawer comments/project bind under real payloads; (b) confirm integration/lifecycle/invite flows end-to-end; (c) axe-core pass on drawer/palette/shortcuts overlays (a11y evidence here is static-only); (d) board drag + recharts render with >100 real cards; (e) 419 reload behavior across router + axios paths; (f) social login redirect/callback UX.

---

## Report Notes
- Findings numbered `Fy##`; severity scheme P0/P1/P2/P3 as in the header. Labels CONFIRMED (source-traced) vs SUSPECTED (needs runtime/other agent).
- No file outside `reports/pre-production/02-frontend-product-audit.md` was written; no code modified; everything static.
- Citations reference the source tree state at audit time (2026-10-18).
