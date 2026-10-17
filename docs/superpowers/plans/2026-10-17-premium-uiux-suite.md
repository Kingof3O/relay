# Premium UI/UX Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Relay Studio (STM) into a tier-1, premium dark-mode productivity platform matching the polish, ergonomics, and tactile responsiveness of Linear, Raycast, and Supabase.

**Architecture:** Build reusable React/TypeScript UI components with Headless UI and Lucide icons, integrate slide-over sheet drawer, keyboard shortcuts engine, dual board/table view switcher, clipboard image paste, markdown rendering with checklists, and celebratory tactile feedback without breaking existing Inertia/Laravel workflows.

**Tech Stack:** React 18, TypeScript, Inertia.js v1, Tailwind CSS v3, Axios, Sonner, Lucide-react, @hello-pangea/dnd.

---

### Task 1: Slide-Over Detail Drawer (`QuickViewDrawer.tsx`)
**Files:**
- Create: `resources/js/Components/Requests/QuickViewDrawer.tsx`
- Modify: `resources/js/Pages/Requests/Index.tsx`
- Modify: `resources/js/Components/Requests/RequestCard.tsx`

**Details:**
- [x] Create `QuickViewDrawer.tsx` sliding in from the right edge with smooth CSS transition.
- [x] Render full request details: editable title, status selector, priority badge, project, assignee picker, description with markdown, attachments list, and quick comment input.
- [x] Connect `QuickViewDrawer` into `Requests/Index.tsx` with selected request state.
- [x] Clicking a card opens the drawer; pressing `Esc` or clicking outside closes it.
- [x] Include an "Expand to full page" button linking to `route('requests.show', request.id)`.
- [x] Verify card status/priority/assignee updates immediately reflect on the Kanban board.

---

### Task 2: Keyboard Shortcuts Engine & Help Overlay (`ShortcutsModal.tsx`)
**Files:**
- Create: `resources/js/Components/ShortcutsModal.tsx`
- Modify: `resources/js/Layouts/AuthenticatedLayout.tsx`

**Details:**
- [x] Create `ShortcutsModal.tsx` showing keyboard shortcuts categorized by Navigation, Actions, and Board.
- [x] Global shortcut listener: Pressing `?` (Shift+/) opens the shortcuts modal.
- [x] Add single-key sequence shortcuts:
  - `G D` -> Navigate to Dashboard
  - `G B` -> Navigate to Studio Board
  - `G P` -> Navigate to Projects
  - `G N` -> Navigate to Notifications Inbox
  - `G S` -> Navigate to Settings
- [x] Ensure shortcuts do not trigger when typing inside inputs, textareas, or contentEditable elements.

---

### Task 3: Dual View Modes (Kanban Board ⇋ Interactive Table / List View)
**Files:**
- Create: `resources/js/Components/Requests/RequestListView.tsx`
- Modify: `resources/js/Pages/Requests/Index.tsx`

**Details:**
- [x] Create `RequestListView.tsx` rendering an obsidian data table with sortable columns: Status, Title, Project, Priority, Assignee, Files, and Quick Action.
- [x] Add View Mode switcher in `Requests/Index.tsx` header: `[ ⊞ Board | ☰ List ]`.
- [x] Persist selected view in `localStorage('relay_board_view_mode')`.
- [x] Ensure all presets (All Work, My Tasks, In Review, Blocked), search, and project filters apply seamlessly to both views.

---

### Task 4: Action-Oriented Command Palette (`CommandPalette.tsx`)
**Files:**
- Modify: `resources/js/Components/CommandPalette.tsx`

**Details:**
- [x] Add an "Actions" section to `CommandPalette.tsx` alongside Search results.
- [x] Add executable command items:
  - "Mark all notifications as read"
  - "Toggle Sidebar"
  - "Filter: My Tasks"
  - "Filter: Urgent Requests"
  - "Filter: Blocked Requests"
  - "Create New Project"
  - "Show Keyboard Shortcuts"
- [x] Trigger appropriate action or navigation when selected.

---

### Task 5: Micro-Interactions & Tactile Delight (Particle Celebration, Undo Toast & 1-Click Share)
**Files:**
- Create: `resources/js/Utils/confetti.ts`
- Modify: `resources/js/Pages/Requests/Index.tsx`
- Modify: `resources/js/Components/Requests/RequestCard.tsx`
- Modify: `resources/js/Pages/Requests/Show.tsx`

**Details:**
- [x] Implement lightweight canvas particle celebration in `resources/js/Utils/confetti.ts` (zero bloated external dependencies).
- [x] Trigger confetti burst when moving a card into "Done" or approving a request.
- [x] Add interactive `[ Undo ]` button in toast when moving cards or updating status, reverting state on click.
- [x] Add 1-click "Copy Ticket Link" button on cards and in the detail drawer with animated tooltip feedback.

---

### Task 6: Drag-and-Drop File Upload & Clipboard Image Paste (`⌘V`)
**Files:**
- Create: `resources/js/Components/Requests/FileDropZone.tsx`
- Modify: `resources/js/Pages/Requests/Show.tsx`
- Modify: `resources/js/Components/Requests/QuickViewDrawer.tsx`

**Details:**
- [x] Implement clipboard paste listener (`window.addEventListener('paste', ...)`): when an image file is in clipboard (`e.clipboardData.files`), upload it to the request and toast success.
- [x] Implement drag-over drop overlay: dragging files over the drawer or page displays a sleek dashed obsidian drop zone.
- [x] Upload dropped files using `POST route('requests.files.store', request.id)`.

---

### Task 7: In-App Image Lightbox Modal (`ImageLightbox.tsx`)
**Files:**
- Create: `resources/js/Components/ImageLightbox.tsx`
- Modify: `resources/js/Pages/Requests/Show.tsx`
- Modify: `resources/js/Components/Requests/QuickViewDrawer.tsx`

**Details:**
- [x] Create `ImageLightbox.tsx` with backdrop blur, zoom toggle, download link, image title, and `Esc` key listener.
- [x] Clicking any image attachment opens the lightbox modal rather than raw browser navigation.

---

### Task 8: Markdown Rendering & Interactive Task Checklists
**Files:**
- Create: `resources/js/Components/MarkdownViewer.tsx`
- Modify: `resources/js/Components/Requests/RequestCard.tsx`
- Modify: `resources/js/Components/Requests/QuickViewDrawer.tsx`
- Modify: `resources/js/Pages/Requests/Show.tsx`

**Details:**
- [x] Create `MarkdownViewer.tsx` supporting markdown formatting (bold, italic, code, blockquote, bullet list, checklists `- [ ]` / `- [x]`).
- [x] Make checklist items interactive: clicking a checklist checkbox updates the description text and saves it.
- [x] Detect checklists in `RequestCard.tsx`: display micro progress indicator (e.g. `2/5` with mini green progress line) on the Kanban card.

---

### Task 9: Collapsible Kanban Columns & In-Column Quick Filter
**Files:**
- Modify: `resources/js/Pages/Requests/Index.tsx`

**Details:**
- [x] Add collapse/expand toggle on each Kanban column header.
- [x] Collapsed columns render as a sleek vertical rail with column dot, vertical label, and counter pill, expanding space for other columns.
- [x] Persist collapsed column IDs in `localStorage('relay_collapsed_columns')`.
- [x] Pressing `/` focuses board search input instantly to filter cards.

---

### Task 10: Multi-Select Bulk Actions Toolbar
**Files:**
- Create: `resources/js/Components/Requests/BulkActionBar.tsx`
- Modify: `resources/js/Pages/Requests/Index.tsx`

**Details:**
- [x] Add card selection state in `Requests/Index.tsx` (`selectedIds: Set<number>`).
- [x] Checkboxes on cards (visible when selecting or on hover with Shift key).
- [x] Render floating bottom toolbar `BulkActionBar.tsx` showing count of selected requests and actions:
  - "Change Status" dropdown
  - "Set Priority" dropdown
  - "Assign To" dropdown
  - "Clear Selection"
- [x] Execute bulk updates via existing `/requests/bulk` or batched API calls.
