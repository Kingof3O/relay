import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkRequestCard, RequestStatus, RequestPriority, WorkspaceUser } from '@/types';
import { DropResult } from '@hello-pangea/dnd';
import { triggerCelebration } from '@/Utils/confetti';
import { toast } from 'sonner';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

interface UseKanbanBoardOptions {
    initialRequests: WorkRequestCard[];
    statuses: Record<string, string>;
    priorities?: Record<string, string>;
    users?: WorkspaceUser[];
}

export function useKanbanBoard({
    initialRequests,
    statuses,
    priorities = {},
    users = [],
}: UseKanbanBoardOptions) {
    const pageProps = usePage<any>().props;
    const authUser = pageProps.auth?.user;
    const initialPreferences = authUser?.preferences;

    const [boardRequests, setBoardRequests] = useState<WorkRequestCard[]>(initialRequests);
    const boardRequestsRef = useRef<WorkRequestCard[]>(boardRequests);

    useEffect(() => {
        boardRequestsRef.current = boardRequests;
    }, [boardRequests]);

    // Roaming view mode ('board' vs 'list')
    const [viewMode, setViewMode] = useState<'board' | 'list'>(() => {
        if (initialPreferences?.board_view_mode) {
            return initialPreferences.board_view_mode;
        }
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('relay_board_view_mode') as 'board' | 'list';
            if (stored) return stored;
        }
        return 'board';
    });

    // Roaming collapsed column array
    const [collapsedColumns, setCollapsedColumns] = useState<string[]>(() => {
        if (Array.isArray(initialPreferences?.collapsed_columns)) {
            return initialPreferences.collapsed_columns;
        }
        if (typeof window !== 'undefined') {
            try {
                return JSON.parse(localStorage.getItem('relay_collapsed_columns') || '[]');
            } catch {
                return [];
            }
        }
        return [];
    });

    useEffect(() => {
        setBoardRequests(initialRequests);
    }, [initialRequests]);

    // Debounced preference persistence to /profile
    const preferenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const persistPreferences = useCallback(
        (newViewMode: 'board' | 'list', newCollapsed: string[]) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('relay_board_view_mode', newViewMode);
                localStorage.setItem('relay_collapsed_columns', JSON.stringify(newCollapsed));
            }

            if (preferenceTimerRef.current) {
                clearTimeout(preferenceTimerRef.current);
            }

            preferenceTimerRef.current = setTimeout(() => {
                router.patch(
                    '/profile',
                    {
                        preferences: {
                            ...(authUser?.preferences || {}),
                            board_view_mode: newViewMode,
                            collapsed_columns: newCollapsed,
                        },
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        preserveUrl: true,
                        only: ['auth'],
                    }
                );
            }, 500);
        },
        [authUser]
    );

    const handleSetViewMode = (mode: 'board' | 'list') => {
        setViewMode(mode);
        persistPreferences(mode, collapsedColumns);
    };

    const toggleColumnCollapse = (columnKey: string) => {
        setCollapsedColumns((prev) => {
            const next = prev.includes(columnKey) ? prev.filter((k) => k !== columnKey) : [...prev, columnKey];
            persistPreferences(viewMode, next);
            return next;
        });
    };

    const handleCardMoved = useCallback((updatedCard: WorkRequestCard) => {
        setBoardRequests((prev) => {
            if (!prev.some((r) => r.id === updatedCard.id)) {
                return [updatedCard, ...prev];
            }
            return prev.map((r) => (r.id === updatedCard.id ? { ...r, ...updatedCard } : r));
        });
    }, []);

    const handleCardUpdated = useCallback((updated: WorkRequestCard) => {
        setBoardRequests((prev) =>
            prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
        );
    }, []);

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const cardId = parseInt(draggableId, 10);
        const destinationStatus = destination.droppableId;
        const sourceStatus = source.droppableId;
        const statusLabel = statuses[destinationStatus] ?? destinationStatus;
        const sourceStatusLabel = statuses[sourceStatus] ?? sourceStatus;

        // Perform exact in-place array reordering so the drop animation lands seamlessly
        setBoardRequests((prevRequests) => {
            const list = [...prevRequests];
            const itemIndex = list.findIndex((r) => r.id === cardId);
            if (itemIndex === -1) return prevRequests;

            const [movedItem] = list.splice(itemIndex, 1);
            const updatedItem: WorkRequestCard = {
                ...movedItem,
                status: destinationStatus as RequestStatus,
                status_label: statusLabel,
            };

            // Find items currently belonging to the destination column
            const destItems = list.filter((r) => r.status === destinationStatus);

            if (destination.index >= destItems.length) {
                // Insert after the last item of destination column
                if (destItems.length > 0) {
                    const lastDestItem = destItems[destItems.length - 1];
                    const lastIdxInList = list.findIndex((r) => r.id === lastDestItem.id);
                    list.splice(lastIdxInList + 1, 0, updatedItem);
                } else {
                    list.push(updatedItem);
                }
            } else {
                // Insert right before target sibling at destination.index
                const targetSibling = destItems[destination.index];
                const siblingIdxInList = list.findIndex((r) => r.id === targetSibling.id);
                list.splice(siblingIdxInList, 0, updatedItem);
            }

            return list;
        });

        if (destinationStatus === 'done') {
            triggerCelebration();
        }

        const movedCard = boardRequestsRef.current.find((r) => r.id === cardId);
        const lockVersion = movedCard?.lock_version;

        notifyUndo(cardId, sourceStatus, sourceStatusLabel, statusLabel);

        try {
            const response = await axios.patch(route('requests.update', cardId), {
                status: destinationStatus,
                lock_version: lockVersion,
            });
            if (response.data?.request) {
                handleCardUpdated(response.data.request);
            }
        } catch (error: any) {
            // Revert on failure
            setBoardRequests((prev) =>
                prev.map((r) =>
                    r.id === cardId
                        ? {
                              ...r,
                              status: sourceStatus as RequestStatus,
                              status_label: sourceStatusLabel,
                          }
                        : r
                )
            );
            const errorMsg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Could not update status. Reverting change.';
            toast.error(errorMsg);
        }
    };

    const notifyUndo = useCallback(
        (cardId: number, previousStatus: string, previousStatusLabel: string, targetStatusLabel: string) => {
            toast.success(`Moved to ${targetStatusLabel}`, {
                action: {
                    label: 'Undo',
                    onClick: async () => {
                        setBoardRequests((prev) =>
                            prev.map((r) =>
                                r.id === cardId
                                    ? {
                                          ...r,
                                          status: previousStatus as RequestStatus,
                                          status_label: previousStatusLabel,
                                      }
                                    : r
                            )
                        );
                        const currentCard = boardRequestsRef.current.find((r) => r.id === cardId);
                        try {
                            const response = await axios.patch(route('requests.update', cardId), {
                                status: previousStatus,
                                lock_version: currentCard?.lock_version,
                            });
                            if (response.data?.request) {
                                handleCardUpdated(response.data.request);
                            }
                            toast.info(`Reverted to ${previousStatusLabel}`);
                        } catch (err: any) {
                            const errorMsg =
                                err?.response?.data?.message ||
                                err?.response?.data?.error ||
                                'Could not undo move.';
                            toast.error(errorMsg);
                        }
                    },
                },
            });
        },
        [handleCardUpdated]
    );

    const handleQuickStatus = async (request: WorkRequestCard, nextStatus: string) => {
        const previousStatus = request.status;
        const statusLabel = statuses[nextStatus] ?? nextStatus;
        const previousStatusLabel = statuses[previousStatus] ?? previousStatus;

        setBoardRequests((prev) =>
            prev.map((r) =>
                r.id === request.id
                    ? {
                          ...r,
                          status: nextStatus as RequestStatus,
                          status_label: statusLabel,
                      }
                    : r
            )
        );

        if (nextStatus === 'done') {
            triggerCelebration();
        }

        notifyUndo(request.id, previousStatus, previousStatusLabel, statusLabel);

        try {
            const response = await axios.patch(route('requests.update', request.id), {
                status: nextStatus,
                lock_version: request.lock_version,
            });
            if (response.data?.request) {
                handleCardUpdated(response.data.request);
            }
        } catch (error: any) {
            setBoardRequests((prev) =>
                prev.map((r) =>
                    r.id === request.id
                        ? {
                              ...r,
                              status: previousStatus,
                              status_label: previousStatusLabel,
                          }
                        : r
                )
            );
            const errorMsg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                'Could not update status. Reverting change.';
            toast.error(errorMsg);
        }
    };

    const handleBulkUpdateStatus = async (ids: number[], status: string) => {
        setBoardRequests((prev) =>
            prev.map((r) =>
                ids.includes(r.id) ? { ...r, status: status as RequestStatus, status_label: statuses[status] ?? status } : r
            )
        );
        toast.success(`Updated ${ids.length} requests`);
        if (status === 'done') {
            triggerCelebration();
        }

        await Promise.all(
            ids.map((id) => axios.patch(route('requests.update', id), { status }).catch(() => {}))
        );
    };

    const handleBulkUpdatePriority = async (ids: number[], priority: string) => {
        setBoardRequests((prev) =>
            prev.map((r) =>
                ids.includes(r.id) ? { ...r, priority: priority as RequestPriority, priority_label: priorities[priority] ?? priority } : r
            )
        );
        toast.success(`Updated priority for ${ids.length} requests`);

        await Promise.all(
            ids.map((id) => axios.patch(route('requests.update', id), { priority }).catch(() => {}))
        );
    };

    const handleBulkUpdateAssignee = async (ids: number[], assigneeId: number | null) => {
        const assignedUser = users.find((u) => u.id === assigneeId) ?? null;
        setBoardRequests((prev) =>
            prev.map((r) =>
                ids.includes(r.id) ? { ...r, assignee_id: assigneeId, assignee: assignedUser } : r
            )
        );
        toast.success(`Reassigned ${ids.length} requests`);

        await Promise.all(
            ids.map((id) => axios.patch(route('requests.update', id), { assignee_id: assigneeId }).catch(() => {}))
        );
    };

    return {
        boardRequests,
        setBoardRequests,
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
    };
}
