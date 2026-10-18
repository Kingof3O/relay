import { C as KanbanBoard, E as BoardHeader, S as RequestListView, T as BoardFilterBar, a as useKanbanBoard, g as QuickCreateModal, i as useBoardFilters, t as Authenticated, x as BulkActionBar, y as QuickViewDrawer } from "./AuthenticatedLayout-CYBG4tVr.js";
import { Head, router, usePage } from "@inertiajs/react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
//#region resources/js/Pages/Requests/Index.tsx
function Index({ requests: initialRequests, projects, users, statuses, priorities, filters }) {
	const authUser = usePage().props.auth?.user;
	const { boardRequests, viewMode, handleSetViewMode, collapsedColumns, toggleColumnCollapse, handleCardMoved, handleDragEnd, handleQuickStatus, handleCardUpdated, handleBulkUpdateStatus, handleBulkUpdatePriority, handleBulkUpdateAssignee } = useKanbanBoard({
		initialRequests,
		statuses,
		priorities,
		users
	});
	const filterState = useBoardFilters({
		requests: boardRequests,
		filters,
		authUser
	});
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [drawerRequestId, setDrawerRequestId] = useState(null);
	const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
	const handleToggleSelect = (id) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};
	const handleBulk = async (cb) => {
		const ids = Array.from(selectedIds);
		setSelectedIds(/* @__PURE__ */ new Set());
		await cb(ids);
	};
	return /* @__PURE__ */ jsxs(Authenticated, {
		header: /* @__PURE__ */ jsx("div", {
			className: "flex items-center justify-between",
			children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] font-semibold uppercase tracking-wider text-zinc-400",
						children: "Project Board"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-zinc-600",
						children: "/"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-[11px] text-zinc-500",
						children: "Live Kanban"
					})
				]
			}), /* @__PURE__ */ jsx("h1", {
				className: "mt-1 text-lg font-semibold text-zinc-100",
				children: "Work Pipeline"
			})] })
		}),
		children: [
			/* @__PURE__ */ jsx(Head, { title: "Work · Board" }),
			/* @__PURE__ */ jsxs("div", {
				className: "mx-auto max-w-[1900px] space-y-5",
				children: [
					/* @__PURE__ */ jsx(BoardHeader, {
						viewMode,
						onViewModeChange: handleSetViewMode,
						onAddRequest: () => setShowCreateModal(true),
						onOpenShortcuts: () => {
							if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-shortcuts"));
						}
					}),
					/* @__PURE__ */ jsx(BoardFilterBar, {
						filters: filterState,
						projects,
						users,
						statuses,
						priorities
					}),
					viewMode === "list" ? /* @__PURE__ */ jsx(RequestListView, {
						requests: filterState.filteredRequests,
						onSelectRequest: (req) => setDrawerRequestId(req.id),
						onQuickStatus: handleQuickStatus,
						selectedIds,
						onToggleSelect: handleToggleSelect,
						onSelectAll: (ids) => setSelectedIds(new Set(ids))
					}) : /* @__PURE__ */ jsx(KanbanBoard, {
						requests: filterState.filteredRequests,
						statuses,
						onDragEnd: handleDragEnd,
						onQuickStatus: handleQuickStatus,
						onOpenDrawer: (req) => setDrawerRequestId(req.id),
						selectedIds,
						onToggleSelect: handleToggleSelect,
						onCardMoved: handleCardMoved,
						collapsedColumns,
						onToggleColumnCollapse: toggleColumnCollapse
					})
				]
			}),
			/* @__PURE__ */ jsx(QuickViewDrawer, {
				requestId: drawerRequestId,
				onClose: () => setDrawerRequestId(null),
				onUpdated: handleCardUpdated,
				projects,
				users,
				statuses,
				priorities
			}),
			/* @__PURE__ */ jsx(BulkActionBar, {
				selectedCount: selectedIds.size,
				onClearSelection: () => setSelectedIds(/* @__PURE__ */ new Set()),
				onBulkUpdateStatus: (status) => handleBulk((ids) => handleBulkUpdateStatus(ids, status)),
				onBulkUpdatePriority: (pri) => handleBulk((ids) => handleBulkUpdatePriority(ids, pri)),
				onBulkUpdateAssignee: (uid) => handleBulk((ids) => handleBulkUpdateAssignee(ids, uid)),
				users,
				statuses,
				priorities
			}),
			/* @__PURE__ */ jsx(QuickCreateModal, {
				show: showCreateModal,
				onClose: () => setShowCreateModal(false),
				projects,
				users,
				onFinished: () => router.reload({ only: ["requests"] })
			})
		]
	});
}
//#endregion
export { Index as default };
