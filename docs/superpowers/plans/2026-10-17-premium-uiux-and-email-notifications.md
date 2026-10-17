# Premium UI/UX & Email Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Relay Studio with transactional HTML email dispatch (Enhanced Dual-Tone Priority style), modern obsidian Sonner toasts, universal dark obsidian modals, a Linear-style Inbox Triage view, and redesigned Settings, Team, and Profile workspaces.

**Architecture:** 
- Laravel Mailable + responsive HTML Blade template rendering priority-accented emails dispatched via queued job upon work creation, reassignment, status changes, and comments.
- Global Sonner toast styling in `AuthenticatedLayout.tsx` with obsidian theme and custom JSX helpers.
- Universal `Modal.tsx` upgraded with `#090a0f` obsidian backdrop and specular highlights, standardized across all modal consumers.
- Linear-inspired triage in `Notifications/Index.tsx` with Unread/All/Assignments tabs, inline read toggle, and zero-inbox state.
- Redesigned `Settings/Index.tsx` and `Profile/Edit.tsx` with high-density visual stats, search filters, active toggles, and modern password strength indicators.

**Tech Stack:** Laravel 11, Blade Mailables, React 18 / TypeScript, Inertia.js v2, Tailwind CSS, Headless UI, Sonner, Lucide React.

**Spec:** `docs/superpowers/specs/2026-10-17-premium-uiux-and-email-notifications-design.md`

## Global Constraints
- Obsidian palette: `#07090e`, `#090a0f`, `#0c0d12`, `#121318`, `#161820`, with `border-white/[0.08]` and specular highlights.
- Zero breaking changes to existing routes, permissions, or model contracts.
- Zero TypeScript / Vite compilation errors on `npm run build`.
- 100% passing tests on `php artisan test`.

---

### Task 1: Transactional HTML Email & Dispatch Engine

**Files:**
- Create: `resources/views/emails/work-request-notification.blade.php`
- Create: `app/Mail/WorkRequestNotificationMail.php`
- Modify: `app/Jobs/SendRequestEmail.php`
- Modify: `app/Services/WorkRequestService.php`
- Test: `tests/Feature/WorkRequestEmailTest.php`

**Interfaces:**
- Produces: `WorkRequestNotificationMail(User $user, WorkRequest $request, array $payload)`
- Consumes: `WorkRequestService::notifyRelevantUsers()`, `SendRequestEmail::dispatch()`

- [x] **Step 1: Write the failing email test**
Create `tests/Feature/WorkRequestEmailTest.php` asserting that when a request is created with an assignee, an email is queued/sent with the `WorkRequestNotificationMail` mailable containing the ticket ID, priority gradient, and link.

- [x] **Step 2: Run test to verify it fails**
Run: `php artisan test tests/Feature/WorkRequestEmailTest.php`
Expected: FAIL (Mailable class does not exist).

- [x] **Step 3: Create Mailable and Blade Template**
Create `app/Mail/WorkRequestNotificationMail.php` and `resources/views/emails/work-request-notification.blade.php` implementing the Enhanced Dual-Tone Priority Accent design with table-based HTML, inline styles, priority accent bar, ticket metadata table, and high-contrast CTA button.

- [x] **Step 4: Update `SendRequestEmail.php` and `WorkRequestService.php`**
Update `SendRequestEmail.php` to send `WorkRequestNotificationMail`. Update `WorkRequestService.php` in `create()` to notify the assignee when `assignee_id` is present.

- [x] **Step 5: Run tests and verify**
Run: `php artisan test tests/Feature/WorkRequestEmailTest.php`
Expected: PASS.

---

### Task 2: Modern Obsidian Toasts & Sonner Custom JSX

**Files:**
- Modify: `resources/js/Layouts/AuthenticatedLayout.tsx`
- Create: `resources/js/lib/toast.tsx`
- Modify: `resources/js/Features/Notifications/components/NotificationPopover.tsx`

**Interfaces:**
- Produces: `notifySuccess(title, description?)`, `notifyError(title, description?)`, `notifyAction(title, actionLabel, onAction)`
- Consumes: `sonner` Toaster component

- [ ] **Step 1: Create Toast Helpers**
Create `resources/js/lib/toast.tsx` exporting custom styled toasts with Lucide icons (`CheckCircle2`, `AlertTriangle`, `Info`, `Sparkles`), specular borders, and undo buttons.

- [ ] **Step 2: Upgrade `<Toaster />` in `AuthenticatedLayout.tsx`**
Configure dark obsidian theme, custom toast container styling (`bg-[#090a0f]/95`, `border-white/[0.08]`, `backdrop-blur-xl`, `shadow-2xl`).

- [ ] **Step 3: Enhance `NotificationPopover.tsx`**
Add tabs for `Unread` and `All`, 1-click "Mark all as read", formatted timestamps, and event badges.

- [ ] **Step 4: Verify build**
Run: `export PATH="/opt/homebrew/bin:$PATH"; npm run build`
Expected: PASS.

---

### Task 3: Universal Obsidian Modal & Dialog System

**Files:**
- Modify: `resources/js/Components/Modal.tsx`
- Modify: `resources/js/Features/Settings/components/MemberFormModal.tsx`
- Modify: `resources/js/Features/Requests/components/SingleRequestForm.tsx`
- Modify: `resources/js/Features/Requests/components/BulkSpreadsheetForm.tsx`
- Modify: `resources/js/Components/ShortcutsModal.tsx`

**Interfaces:**
- Produces: Standardized modal dialog with specular top border, backdrop blur, smooth spring entrance, and keyboard badges.

- [ ] **Step 1: Upgrade `Modal.tsx`**
Change background from `#0d1322` to `#090a0f/95`, add specular highlight border, backdrop blur, and smooth entrance scale/opacity transition.

- [ ] **Step 2: Upgrade `MemberFormModal.tsx`**
Modernize header, role selector pills, clean form controls, validation errors, and `Esc` badge.

- [ ] **Step 3: Upgrade `SingleRequestForm.tsx` & `BulkSpreadsheetForm.tsx`**
Add Linear header, keyboard hints (`⌘Enter` to submit), and clean obsidian inputs.

- [ ] **Step 4: Upgrade `ShortcutsModal.tsx`**
Refine Raycast-style shortcut groups and key badges.

- [ ] **Step 5: Verify build**
Run: `export PATH="/opt/homebrew/bin:$PATH"; npm run build`
Expected: PASS.

---

### Task 4: Linear-Style Inbox & Updates Triage (`Notifications/Index.tsx`)

**Files:**
- Modify: `resources/js/Pages/Notifications/Index.tsx`
- Modify: `app/Http/Controllers/NotificationController.php`

**Interfaces:**
- Produces: Triage view with Unread / All / Assignments tabs, inline read toggle without page reload, and zero-inbox state.

- [ ] **Step 1: Update `Notifications/Index.tsx`**
Implement triage tabs: `Inbox (Unread)`, `All Activity`, and `Assignments`. Add search filter, unread count badge, and "Mark all as read" button.

- [ ] **Step 2: Add interactive inline triage row**
Hover action to toggle read/unread status, direct link navigation to `#REQ-{id}`, relative time formatting, and actor avatar.

- [ ] **Step 3: Add Zero-Inbox banner**
Render sleek zero-inbox state with checkmark icon and shortcut jump (`G` then `B`).

- [ ] **Step 4: Verify tests & build**
Run: `php artisan test` and `npm run build`
Expected: PASS.

---

### Task 5: Redesigned Settings & Team Workspace (`Settings/Index.tsx`)

**Files:**
- Modify: `resources/js/Pages/Settings/Index.tsx`
- Modify: `resources/js/Features/Settings/components/TeamManagementCard.tsx`
- Modify: `resources/js/Features/Settings/components/ProjectsManagementCard.tsx`
- Modify: `resources/js/Features/Settings/components/WorkspaceSnapshotCard.tsx`

**Interfaces:**
- Produces: Modernized tabs, team member search, active status toggle switch, role pills, and project color swatches.

- [ ] **Step 1: Upgrade `Settings/Index.tsx`**
Segmented pill tabs with active indicator and count badges.

- [ ] **Step 2: Upgrade `TeamManagementCard.tsx`**
Add search filter input for members, active status switch, distinct role color pills (`Developer`, `Designer`, `Stakeholder`, `Admin`), and clean action menu.

- [ ] **Step 3: Upgrade `ProjectsManagementCard.tsx`**
Add project color swatches, active request counts, reorder handles, and inline rename/archive triggers.

- [ ] **Step 4: Verify tests & build**
Run: `php artisan test` and `npm run build`
Expected: PASS.

---

### Task 6: Redesigned Profile & Security Settings (`Profile/Edit.tsx`)

**Files:**
- Modify: `resources/js/Pages/Profile/Edit.tsx`
- Modify: `resources/js/Features/Profile/components/UpdateProfileInformationForm.tsx`
- Modify: `resources/js/Features/Profile/components/UpdatePasswordForm.tsx`

**Interfaces:**
- Produces: Identity hero card with avatar and stats, obsidian input cards, password strength meter, and requirements checklist.

- [ ] **Step 1: Upgrade `Profile/Edit.tsx`**
Add visual identity hero banner with colorful initials avatar, handle, role, member date, and work stats (assigned requests, completed requests).

- [ ] **Step 2: Upgrade `UpdateProfileInformationForm.tsx`**
Modern obsidian inputs for Display Name, Username, and Email with clear validation states and subtle save indicator.

- [ ] **Step 3: Upgrade `UpdatePasswordForm.tsx`**
Add real-time password strength meter, requirements checklist (length, complexity), and tactile save feedback.

- [ ] **Step 4: Verify tests & build**
Run: `php artisan test` and `npm run build`
Expected: PASS.
