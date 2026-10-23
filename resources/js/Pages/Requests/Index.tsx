import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
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
        viewMode,
        handleSetViewMode,
        collapsedColumns,
        toggleColumnCollapse,
        handleCardMoved,
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

    const activeDrawerCard = drawerRequestId
        ? filterState.filteredRequests.find((r) => r.id === drawerRequestId) ?? null
        : null;
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

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
                <PageHeader
                    crumbs={[
                        { label: 'Work', href: route('requests.index') },
                        { label: 'Pipeline' },
                    ]}
                    title="Work Pipeline"
                />
            }
        >
            <Head title="Work · Board" />

            <div className="mx-auto max-w-[1900px] space-y-5">
                <BoardHeader
                    viewMode={viewMode}
                    onViewModeChange={handleSetViewMode}
                    onAddRequest={() => setShowCreateModal(true)}
                    onOpenShortcuts={() => {
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('open-shortcuts'));
                        }
                    }}
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
                        onCardMoved={handleCardMoved}
                        collapsedColumns={collapsedColumns}
                        onToggleColumnCollapse={toggleColumnCollapse}
                    />
                )}
            </div>

            <QuickViewDrawer
                requestId={drawerRequestId}
                initialRequest={activeDrawerCard}
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
