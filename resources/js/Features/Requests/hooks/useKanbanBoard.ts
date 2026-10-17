import { useState, useEffect } from 'react';
import { WorkRequestCard, RequestStatus, RequestPriority, WorkspaceUser } from '@/types';
import { DropResult } from '@hello-pangea/dnd';
import { triggerCelebration } from '@/Utils/confetti';
import { toast } from 'sonner';
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
    const [boardRequests, setBoardRequests] = useState<WorkRequestCard[]>(initialRequests);

    useEffect(() => {
        setBoardRequests(initialRequests);
    }, [initialRequests]);

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

        toast.success(`Moved to ${statusLabel}`, {
            action: {
                label: 'Undo',
                onClick: async () => {
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
                    try {
                        await axios.patch(route('requests.update', cardId), { status: sourceStatus });
                    } catch {
                        toast.error('Could not undo move.');
                    }
                },
            },
        });

        try {
            await axios.patch(route('requests.update', cardId), { status: destinationStatus });
        } catch {
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
            toast.error('Could not update status. Reverting change.');
        }
    };

    const handleQuickStatus = async (request: WorkRequestCard, nextStatus: string) => {
        const oldStatus = request.status;
        const statusLabel = statuses[nextStatus] ?? nextStatus;
        const oldStatusLabel = statuses[oldStatus] ?? oldStatus;

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

        toast.success(`Moved to ${statusLabel}`, {
            action: {
                label: 'Undo',
                onClick: () => handleQuickStatus(request, oldStatus),
            },
        });

        try {
            await axios.patch(route('requests.update', request.id), { status: nextStatus });
        } catch {
            setBoardRequests((prev) =>
                prev.map((r) =>
                    r.id === request.id
                        ? {
                              ...r,
                              status: oldStatus,
                              status_label: oldStatusLabel,
                          }
                        : r
                )
            );
            toast.error('Could not update status.');
        }
    };

    const handleCardUpdated = (updated: WorkRequestCard) => {
        setBoardRequests((prev) =>
            prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
        );
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
        handleDragEnd,
        handleQuickStatus,
        handleCardUpdated,
        handleBulkUpdateStatus,
        handleBulkUpdatePriority,
        handleBulkUpdateAssignee,
    };
}
