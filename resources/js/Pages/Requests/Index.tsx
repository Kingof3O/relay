import { useState, useEffect, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
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
    const currentWorkspace = usePage<PageProps>().props.currentWorkspace;

    const {
        boardRequests,
        viewMode,
        handleSetViewMode,
        collapsedColumns,
        toggleColumnCollapse,
        handleCardCreated,
        handleCardDeleted,
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

    const onCardDeleted = useCallback(
        (deletedId: number) => {
            handleCardDeleted(deletedId);
            setDrawerRequestId((currentId) => (currentId === deletedId ? null : currentId));
        },
        [handleCardDeleted]
    );

    // Live WebSockets synchronization on /requests
    useEffect(() => {
        const echo = (window as unknown as { Echo?: any }).Echo;
        if (!echo || !currentWorkspace?.id) return;

        try {
            const channel = echo.private(`workspace.${currentWorkspace.id}`);

            channel.listen('.WorkRequestCreated', (e: { request?: WorkRequestCard; actor_id?: number }) => {
                if (e?.request) {
                    handleCardCreated(e.request);
                    toast.info(`New task #${e.request.id} created: ${e.request.title}`);
                }
            });

            channel.listen('.WorkRequestDeleted', (e: { request_id?: number; workspace_id?: number; actor_id?: number }) => {
                if (e?.request_id) {
                    onCardDeleted(e.request_id);
                    toast.info(`Task #${e.request_id} deleted`);
                }
            });

            channel.listen('.WorkRequestMoved', (e: { request?: WorkRequestCard; actor_id?: number; request_id?: number; status?: string }) => {
                if (e?.request) {
                    handleCardMoved(e.request);
                    toast.info(`Card #${e.request.id} moved`, {
                        description: `Status changed to ${e.request.status_label || e.request.status}`,
                    });
                }
            });

            channel.listen('.WorkRequestCommented', (e: { request_id?: number; body?: string }) => {
                if (e?.request_id) {
                    toast.info(`New comment on #REQ-${e.request_id}`);
                }
            });

            channel.listen('.SubtaskUpdated', (e: { parent_id?: number; subtask?: WorkRequestCard; action?: string }) => {
                if (e?.subtask) {
                    handleCardUpdated(e.subtask);
                }
            });

            return () => {
                echo.leave(`workspace.${currentWorkspace.id}`);
            };
        } catch {
            // Graceful fallback
        }
    }, [currentWorkspace?.id, handleCardCreated, onCardDeleted, handleCardMoved, handleCardUpdated]);

    useEffect(() => {
        if (drawerRequestId !== null && !boardRequests.some((r) => r.id === drawerRequestId)) {
            setDrawerRequestId(null);
        }
    }, [drawerRequestId, boardRequests]);

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
                        onCardCreated={handleCardCreated}
                        onCardDeleted={onCardDeleted}
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
                onFinished={(created) => {
                    if (created) {
                        if (Array.isArray(created)) {
                            created.forEach((c) => handleCardCreated(c));
                        } else {
                            handleCardCreated(created);
                        }
                    } else {
                        router.reload({ only: ['requests'] });
                    }
                }}
            />
        </AuthenticatedLayout>
    );
}
