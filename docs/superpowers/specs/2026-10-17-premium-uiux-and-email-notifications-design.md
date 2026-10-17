# Relay Studio: Premium UI/UX & Email Notifications Specification

## 1. Overview & Objectives
Transform Relay Studio into a premier, tier-1 engineering workspace by addressing 6 core areas:
1. **Transactional Email Notification Engine**: Send rich, responsive, dark-mode emails (Enhanced Dual-Tone Priority Accent style) when work is assigned, updated, moved to review, or commented on.
2. **Modern Obsidian Toasts**: Upgrade Sonner configuration and provide rich custom toasts with ticket metadata, action buttons, and undo capabilities.
3. **Universal Obsidian Modal System**: Replace legacy blue modal styling (`#0d1322`) with deep obsidian (`#090a0f`), specular lighting, keyboard shortcuts badges (`Esc`, `⌘Enter`), and smooth physics.
4. **Linear-Style Inbox & Updates (`/notifications`)**: Full triage experience with Unread / All / Mentions tabs, quick mark-as-read hover controls, and zero-inbox state.
5. **Redesigned Settings & Team Workspace (`/settings`)**: Segmented tabs, member roster search, active status toggle switches, role pills, and project color swatches.
6. **Redesigned Profile & Identity Settings (`/profile`)**: Visual identity hero card with stats, modern profile inputs, and password strength indicator.

---

## 2. Technical Architecture & Component Breakdown

### 2.1 Transactional Email System
- **Template**: `resources/views/emails/work-request-notification.blade.php`
  - Bulletproof HTML email with inline CSS tested across dark mode clients (Gmail, Apple Mail, Outlook).
  - Dynamic Priority Accent Top Bar:
    - *Urgent*: Rose-to-Crimson gradient (`#f43f5e` → `#e11d48`)
    - *High*: Amber-to-Orange gradient (`#f59e0b` → `#d97706`)
    - *Normal*: Violet-to-Indigo gradient (`#8b5cf6` → `#6366f1`)
    - *Low*: Slate gradient (`#71717a` → `#a1a1aa`)
  - Monospace ticket ID (`#REQ-{id}`), bold white title, contextual action message, metadata grid (Initiative, Assignee, Requester, Priority), and high-contrast CTA button.
- **Mailable**: `app/Mail/WorkRequestNotificationMail.php`
  - Accepts `$user`, `$workRequest`, and `$eventPayload` (event type, message, actor name).
  - Configures subject line (e.g. `[Relay] #REQ-104 - Fix Stripe Webhook (Urgent)`).
- **Queue Job**: `app/Jobs/SendRequestEmail.php`
  - Updated to send `WorkRequestNotificationMail` with fallback to immediate sync delivery if queue is synchronous.
- **Triggers**:
  - `WorkRequestService::create()`: Dispatches email to assignee when request is created with an assignee.
  - `WorkRequestService::update()`: Dispatches email on reassignment, status transitions (review, done, reopened, blocked), and updates.
  - `WorkRequestService::addComment()`: Dispatches email to requester and assignee.

### 2.2 Modern Obsidian Toasts & Notification Popover
- **Sonner Configuration in `AuthenticatedLayout.tsx`**:
  - Custom dark obsidian theme: `bg-[#090a0f]/95`, `border-white/[0.08]`, `backdrop-blur-xl`, `shadow-2xl`.
  - Rich toast triggers with icons: CheckCircle2 for success, AlertTriangle for warnings, ArrowRightLeft for status transitions.
- **Notification Popover (`NotificationPopover.tsx`)**:
  - Filter tabs: `Unread` and `All`.
  - 1-click "Mark all as read" button.
  - Formatted relative timestamps and event icons.

### 2.3 Universal Obsidian Modal System
- **Core Modal (`resources/js/Components/Modal.tsx`)**:
  - Background updated to `bg-[#090a0f]/95` with specular highlight `border-white/[0.08]`, backdrop blur, and smooth entrance animation.
- **Modal Implementations**:
  - `MemberFormModal.tsx`: Clean form with role pills, validation alerts, and keyboard shortcut tips.
  - `QuickCreateModal.tsx`, `SingleRequestForm.tsx`, `BulkSpreadsheetForm.tsx`: Crisp obsidian cards with keyboard save shortcut (`⌘Enter`).
  - `ShortcutsModal.tsx`: Sleek Raycast-style keyboard cheat-sheet.

### 2.4 Linear-Style Inbox & Updates (`Notifications/Index.tsx`)
- **Triage Navigation**:
  - Tabs: `Inbox (Unread)`, `All Activity`, `Assignments`.
  - Search/filter input and "Mark all as read" button.
- **Notification Cards**:
  - Event pill badge (Status change, Assignment, Blocker, Comment).
  - Hover action: 1-click toggle read/unread status without navigating away.
  - Direct navigation link to request.
- **Zero Inbox State**:
  - Visual checkmark banner with keyboard shortcut hint (`G` then `B` to open Board).

### 2.5 Settings & Team Workspace (`Settings/Index.tsx`)
- **Subcomponents in `Features/Settings/components/`**:
  - `WorkspaceSnapshotCard`: KPI summary of active projects and team members.
  - `ProjectsManagementCard`: Project color swatches, sort order handles, request counts, and inline rename/archive.
  - `TeamManagementCard`: Team search bar, active status toggle switch, role badges (`Developer`, `Designer`, `Stakeholder`, `Admin`), and modern member credentials modal.

### 2.6 Profile & Identity Settings (`Profile/Edit.tsx`)
- **Visual Identity Hero**:
  - Avatar with initials and colorful gradient, `@username`, role pill, joined timestamp, and activity stats (total requests assigned, completed).
- **Forms in `Features/Profile/components/`**:
  - `UpdateProfileInformationForm`: High-density obsidian inputs, validation errors, and subtle saving indicator.
  - `UpdatePasswordForm`: Current password, new password with dynamic password strength meter, and requirements checklist.

---

## 3. Verification & Testing Plan
1. **PHPUnit Backend Tests**:
   - Add/update tests in `tests/Feature/Workspace/RequestWorkspaceTest.php` and `tests/Feature/NotificationTest.php` verifying:
     - `WorkRequestNotificationMail` renders proper HTML with priority accent, ticket ID, and CTA link.
     - Assignee receives email on work creation.
     - Relevant users receive email on status change and comments.
   - Run `php artisan test` (must pass 100%).
2. **Frontend Build & Types**:
   - Run `npm run build` (confirm 0 TypeScript and 0 Vite errors).
3. **Manual / Visual Verification**:
   - Verify `email-preview.html` and transactional email rendering.
   - Verify modal opening/closing animations and keyboard shortcuts.
   - Verify inbox triage tab switching and read toggling.
