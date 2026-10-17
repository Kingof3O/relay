import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { WorkspaceProject, WorkspaceUser, WorkRequestCard } from '@/types/workspace';
import {
    BoardHeader,
    BoardFilterBar,
    KanbanBoard,
    RequestListView,
    BulkActionBar,
    QuickViewDrawer,
    QuickCreateModal,
    useKanbanBoard,
    useBoardFilters,
    type BoardFilters,
} from '@/Features/Requests';

export default function Index({
    requests: initialRequests,
    projects,
    users,
    statuses,
    priorities,
    filters,
}: PageProps<{
    requests: WorkRequestCard[];
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    filters: BoardFilters;
}>) {
    const authUser = usePage<PageProps>().props.auth?.user;

    const {
        boardRequests,
        handleDragEnd,
        handleQuickStatus,
        handleCardUpdated,
        handleBulkUpdateStatus,
        handleBulkUpdatePriority,
        handleBulkUpdateAssignee,
    } = useKanbanBoard({ initialRequests, statuses, priorities, users });

    const filterState = useBoardFilters({ requests: boardRequests, filters, authUser });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [drawerRequestId, setDrawerRequestId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const [viewMode, setViewMode] = useState<'board' | 'list'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('relay_board_view_mode') as 'board' | 'list') || 'board';
        }
        return 'board';
    });

    const handleSetViewMode = (mode: 'board' | 'list') => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('relay_board_view_mode', mode);
        }
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulk = async (cb: (ids: number[]) => Promise<void>) => {
        const ids = Array.from(selectedIds);
        setSelectedIds(new Set());
        await cb(ids);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Project Board</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[11px] text-zinc-500">Live Kanban</span>
                        </div>
                        <h1 className="mt-1 text-lg font-semibold text-zinc-100">Work Pipeline</h1>
                    </div>
                </div>
            }
        >
            <Head title="Work · Board" />

            <div className="mx-auto max-w-[1900px] space-y-5">
                <BoardHeader
                    viewMode={viewMode}
                    onViewModeChange={handleSetViewMode}
                    onAddRequest={() => setShowCreateModal(true)}
                />

                <BoardFilterBar
                    filters={filterState}
                    projects={projects}
                    users={users}
                    statuses={statuses}
                    priorities={priorities}
                />

                {viewMode === 'list' ? (
                    <RequestListView
                        requests={filterState.filteredRequests}
                        onSelectRequest={(req) => setDrawerRequestId(req.id)}
                        onQuickStatus={handleQuickStatus}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                        onSelectAll={(ids) => setSelectedIds(new Set(ids))}
                    />
                ) : (
                    <KanbanBoard
                        requests={filterState.filteredRequests}
                        statuses={statuses}
                        onDragEnd={handleDragEnd}
                        onQuickStatus={handleQuickStatus}
                        onOpenDrawer={(req) => setDrawerRequestId(req.id)}
                        selectedIds={selectedIds}
                        onToggleSelect={handleToggleSelect}
                    />
                )}
            </div>

            <QuickViewDrawer
                requestId={drawerRequestId}
                onClose={() => setDrawerRequestId(null)}
                onUpdated={handleCardUpdated}
                projects={projects}
                users={users}
                statuses={statuses}
                priorities={priorities}
            />

            <BulkActionBar
                selectedCount={selectedIds.size}
                onClearSelection={() => setSelectedIds(new Set())}
                onBulkUpdateStatus={(status: string) => handleBulk((ids: number[]) => handleBulkUpdateStatus(ids, status))}
                onBulkUpdatePriority={(pri: string) => handleBulk((ids: number[]) => handleBulkUpdatePriority(ids, pri))}
                onBulkUpdateAssignee={(uid: number | null) => handleBulk((ids: number[]) => handleBulkUpdateAssignee(ids, uid))}
                users={users}
                statuses={statuses}
                priorities={priorities}
            />

            <QuickCreateModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                projects={projects}
                users={users}
                onFinished={() => router.reload({ only: ['requests'] })}
            />
        </AuthenticatedLayout>
    );
}
