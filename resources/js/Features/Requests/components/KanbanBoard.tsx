import React, { useMemo, useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ChevronLeft, ChevronRight, Inbox, Plus } from 'lucide-react';
import { WorkRequestCard, PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import EmptyState from '@/Components/EmptyState';
import RequestCard from './RequestCard';

interface KanbanBoardProps {
    requests: WorkRequestCard[];
    statuses: Record<string, string>;
    onDragEnd: (result: DropResult) => void;
    onQuickStatus: (request: WorkRequestCard, nextStatus: string) => void;
    onOpenDrawer: (request: WorkRequestCard) => void;
    selectedIds: Set<number>;
    onToggleSelect: (id: number) => void;
    onCardCreated?: (card: WorkRequestCard) => void;
    onCardDeleted?: (requestId: number) => void;
    onCardMoved?: (card: WorkRequestCard) => void;
    collapsedColumns?: string[];
    onToggleColumnCollapse?: (columnKey: string) => void;
    isLoading?: boolean;
}

const columnHeaders: Record<string, { dot: string }> = {
    new: { dot: 'bg-zinc-500' },
    ready: { dot: 'bg-blue-400' },
    doing: { dot: 'bg-amber-400' },
    review: { dot: 'bg-purple-400' },
    done: { dot: 'bg-emerald-400' },
};

export default function KanbanBoard({
    requests,
    statuses,
    onDragEnd,
    onQuickStatus,
    onOpenDrawer,
    selectedIds,
    onToggleSelect,
    onCardCreated,
    onCardDeleted,
    onCardMoved,
    collapsedColumns: propCollapsedColumns,
    onToggleColumnCollapse: propToggleColumnCollapse,
    isLoading = false,
}: KanbanBoardProps) {
    const currentWorkspace = usePage<PageProps>().props.currentWorkspace;

    // Internal fallback for collapsed columns if not passed down as prop
    const [internalCollapsedColumns, setInternalCollapsedColumns] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                return JSON.parse(localStorage.getItem('relay_collapsed_columns') || '[]');
            } catch {
                return [];
            }
        }
        return [];
    });

    const activeCollapsed = propCollapsedColumns ?? internalCollapsedColumns;

    const toggleColumnCollapse = (columnKey: string) => {
        if (propToggleColumnCollapse) {
            propToggleColumnCollapse(columnKey);
        } else {
            setInternalCollapsedColumns((prev) => {
                const next = prev.includes(columnKey) ? prev.filter((k) => k !== columnKey) : [...prev, columnKey];
                if (typeof window !== 'undefined') {
                    localStorage.setItem('relay_collapsed_columns', JSON.stringify(next));
                }
                return next;
            });
        }
    };

    // Live WebSockets via Laravel Reverb & Multi-Tab BroadcastChannel
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. BroadcastChannel sync for instant same-origin browser tabs
        let bc: BroadcastChannel | null = null;
        try {
            bc = new BroadcastChannel('relay_workspace_live_sync');
            bc.onmessage = (event) => {
                const data = event.data;
                if (!data) return;

                if (data.type === 'CARD_MOVED') {
                    const card = data.card || data.request;
                    if (card) {
                        onCardMoved?.(card);
                    }
                } else if (data.type === 'CARD_CREATED') {
                    const card = data.card || data.request;
                    if (card) {
                        onCardCreated?.(card);
                    }
                } else if (data.type === 'CARD_DELETED') {
                    const requestId = data.requestId ?? data.request_id ?? data.id;
                    if (requestId) {
                        onCardDeleted?.(Number(requestId));
                    }
                }
            };
        } catch {
            // Ignore if BroadcastChannel unsupported
        }

        // 2. Laravel Echo private workspace channel
        const echo = (window as unknown as { Echo?: any }).Echo;
        if (echo && currentWorkspace?.id) {
            try {
                const channel = echo.private(`workspace.${currentWorkspace.id}`);

                channel.listen('.WorkRequestCreated', (e: { request: WorkRequestCard; actor_id?: number }) => {
                    if (e?.request) {
                        onCardCreated?.(e.request);
                        toast.info(`New task #${e.request.id} created: ${e.request.title}`);
                    }
                });

                channel.listen('.WorkRequestDeleted', (e: { request_id: number; workspace_id: number; actor_id?: number }) => {
                    if (e?.request_id) {
                        onCardDeleted?.(e.request_id);
                        toast.info(`Task #${e.request_id} deleted`);
                    }
                });

                channel.listen('.WorkRequestMoved', (e: { request?: WorkRequestCard; actor_id?: number; request_id?: number; status?: string }) => {
                    if (e?.request) {
                        onCardMoved?.(e.request);
                        toast.info(`Card #${e.request.id} moved`, {
                            description: `Status changed to ${e.request.status_label || e.request.status}`,
                        });
                    }
                });

                channel.listen('.WorkRequestCommented', (e: { request_id: number; body?: string }) => {
                    toast.info(`New comment on #REQ-${e.request_id}`);
                });

                return () => {
                    bc?.close();
                    echo.leave(`workspace.${currentWorkspace.id}`);
                };
            } catch {
                // Graceful fallback
            }
        }

        return () => {
            bc?.close();
        };
    }, [currentWorkspace?.id, onCardMoved, onCardCreated, onCardDeleted]);

    const columns = useMemo(
        () =>
            Object.entries(statuses).map(([value, label]) => ({
                value,
                label,
                requests: requests.filter((request) => request.status === value),
            })),
        [requests, statuses]
    );

    // Vim / Linear Keyboard Navigation State
    const [focusedColIndex, setFocusedColIndex] = useState<number | null>(null);
    const [focusedCardIndex, setFocusedCardIndex] = useState<number | null>(null);

    const focusedCard: WorkRequestCard | null = useMemo(() => {
        if (focusedColIndex === null || focusedCardIndex === null) return null;
        const col = columns[focusedColIndex];
        if (!col || !col.requests[focusedCardIndex]) return null;
        return col.requests[focusedCardIndex];
    }, [columns, focusedColIndex, focusedCardIndex]);

    // Vim navigation listener (J, K, H, L, Space, Enter)
    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable;
            if (isInput) return;

            if (e.metaKey || e.ctrlKey || e.altKey) return;

            const key = e.key;

            if (key === 'j' || key === 'J') {
                e.preventDefault();
                setFocusedColIndex((prevCol) => {
                    let colIdx = prevCol ?? 0;
                    if (!columns[colIdx]?.requests.length) {
                        const firstWithCards = columns.findIndex((c) => c.requests.length > 0);
                        if (firstWithCards !== -1) colIdx = firstWithCards;
                    }
                    setFocusedCardIndex((prevCard) => {
                        const colRequests = columns[colIdx]?.requests || [];
                        if (colRequests.length === 0) return null;
                        if (prevCard === null) return 0;
                        return Math.min(colRequests.length - 1, prevCard + 1);
                    });
                    return colIdx;
                });
            } else if (key === 'k' || key === 'K') {
                e.preventDefault();
                setFocusedColIndex((prevCol) => {
                    let colIdx = prevCol ?? 0;
                    if (!columns[colIdx]?.requests.length) {
                        const firstWithCards = columns.findIndex((c) => c.requests.length > 0);
                        if (firstWithCards !== -1) colIdx = firstWithCards;
                    }
                    setFocusedCardIndex((prevCard) => {
                        const colRequests = columns[colIdx]?.requests || [];
                        if (colRequests.length === 0) return null;
                        if (prevCard === null) return 0;
                        return Math.max(0, prevCard - 1);
                    });
                    return colIdx;
                });
            } else if (key === 'h' || key === 'H') {
                e.preventDefault();
                setFocusedColIndex((prevCol) => {
                    const currentCol = prevCol ?? 0;
                    const nextCol = Math.max(0, currentCol - 1);
                    setFocusedCardIndex((prevCard) => {
                        const targetReqs = columns[nextCol]?.requests || [];
                        if (targetReqs.length === 0) return null;
                        if (prevCard === null) return 0;
                        return Math.min(targetReqs.length - 1, prevCard);
                    });
                    return nextCol;
                });
            } else if (key === 'l' || key === 'L') {
                e.preventDefault();
                setFocusedColIndex((prevCol) => {
                    const currentCol = prevCol ?? 0;
                    const nextCol = Math.min(columns.length - 1, currentCol + 1);
                    setFocusedCardIndex((prevCard) => {
                        const targetReqs = columns[nextCol]?.requests || [];
                        if (targetReqs.length === 0) return null;
                        if (prevCard === null) return 0;
                        return Math.min(targetReqs.length - 1, prevCard);
                    });
                    return nextCol;
                });
            } else if (key === ' ' || key === 'Enter') {
                if (focusedCard) {
                    e.preventDefault();
                    onOpenDrawer(focusedCard);
                }
            } else if (key === 'Escape') {
                setFocusedColIndex(null);
                setFocusedCardIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [columns, focusedCard, onOpenDrawer]);

    // Scroll focused card into view smoothly
    useEffect(() => {
        if (focusedCard) {
            const cardEl = document.getElementById(`kanban-card-${focusedCard.id}`);
            if (cardEl) {
                cardEl.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
            }
        }
    }, [focusedCard]);

    // Loading Skeleton state
    if (isLoading) {
        return (
            <div className="flex min-w-0 gap-3.5 sm:gap-4 overflow-x-auto pb-4 custom-scroll board-scroll pr-4 sm:pr-6 animate-pulse">
                {Object.keys(statuses).map((key) => (
                    <div
                        key={key}
                        className="flex min-h-[580px] min-w-[260px] flex-1 max-w-[340px] flex-col rounded-xl border border-white/[0.05] bg-[#111216] p-3 shadow-sm space-y-3"
                    >
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-zinc-700" />
                                <div className="h-3 w-20 rounded bg-zinc-800" />
                            </div>
                            <div className="h-4 w-6 rounded bg-zinc-800" />
                        </div>
                        <div className="space-y-3 pt-2">
                            {[1, 2, 3].map((n) => (
                                <div
                                    key={n}
                                    className="h-28 w-full rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5 space-y-2.5"
                                >
                                    <div className="flex justify-between">
                                        <div className="h-3 w-16 rounded bg-zinc-800" />
                                        <div className="h-3 w-8 rounded bg-zinc-800" />
                                    </div>
                                    <div className="h-3.5 w-3/4 rounded bg-zinc-800" />
                                    <div className="h-3 w-1/2 rounded bg-zinc-850" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty Pipeline State (0 tickets)
    if (requests.length === 0) {
        return (
            <div className="flex min-h-[480px] w-full items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-[#0c0d12]/50 p-12 text-center backdrop-blur-sm animate-in fade-in duration-200">
                <EmptyState
                    icon={Inbox}
                    title="No work requests in pipeline"
                    description="The pipeline is currently clear. Create a new work request or adjust your active board filters to inspect backlog items."
                    action={
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    window.dispatchEvent(new CustomEvent('open-quick-create'));
                                }
                            }}
                            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-200 active:scale-[0.98]"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Create Work Request</span>
                            <kbd className="rounded bg-zinc-200 px-1 py-0.5 text-[9px] font-mono text-zinc-800">C</kbd>
                        </button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex min-w-0 gap-3.5 sm:gap-4 overflow-x-auto pb-4 custom-scroll board-scroll pr-4 sm:pr-6">
                    {columns.map((column, colIdx) => {
                        const style = columnHeaders[column.value] ?? { dot: 'bg-zinc-400' };
                        const isCollapsed = activeCollapsed.includes(column.value);

                        if (isCollapsed) {
                            return (
                                <div
                                    key={column.value}
                                    onClick={() => toggleColumnCollapse(column.value)}
                                    className="flex min-h-[580px] w-12 shrink-0 flex-col items-center justify-between rounded-xl border border-zinc-800 bg-[#0e1015] py-4 cursor-pointer hover:border-zinc-700 transition-colors shadow-sm select-none"
                                    title={`Expand ${column.label}`}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-1 text-[10px] font-mono text-zinc-400">
                                            {column.requests.length}
                                        </span>
                                    </div>
                                    <div className="py-8">
                                        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase transform -rotate-90 block whitespace-nowrap">
                                            {column.label}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-zinc-500 hover:text-zinc-300"
                                        title="Expand column"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <section
                                key={column.value}
                                className={`flex min-h-[580px] min-w-[260px] flex-1 max-w-[340px] flex-col rounded-xl border p-3 shadow-sm transition-colors ${
                                    focusedColIndex === colIdx
                                        ? 'border-violet-500/30 bg-[#111218]'
                                        : 'border-white/[0.07] bg-[#111216]'
                                }`}
                            >
                                <div className="mb-3 flex items-center justify-between border-b border-zinc-800/80 px-1 pb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                                            {column.label}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-1.5 text-[10px] font-medium tabular-nums text-zinc-400">
                                            {column.requests.length}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toggleColumnCollapse(column.value)}
                                            className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                                            title="Collapse column"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <Droppable droppableId={column.value}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`custom-scroll flex-1 rounded-lg p-1 transition-colors duration-150 overflow-y-auto ${
                                                snapshot.isDraggingOver
                                                    ? 'bg-zinc-850/50 ring-1 ring-zinc-700/60'
                                                    : ''
                                            }`}
                                        >
                                            {column.requests.length > 0 ? (
                                                column.requests.map((request, index) => (
                                                    <RequestCard
                                                        key={request.id}
                                                        request={request}
                                                        index={index}
                                                        onQuickStatus={onQuickStatus}
                                                        onOpenDrawer={onOpenDrawer}
                                                        isSelected={selectedIds.has(request.id)}
                                                        onToggleSelect={onToggleSelect}
                                                        isKeyboardFocused={focusedCard?.id === request.id}
                                                    />
                                                ))
                                            ) : !snapshot.isDraggingOver ? (
                                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-850 px-3 py-16 text-center text-xs text-zinc-600">
                                                    <span>Drop cards here</span>
                                                </div>
                                            ) : null}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </section>
                        );
                    })}
                    <div className="h-full w-2 shrink-0 pointer-events-none" aria-hidden="true" />
                </div>
            </DragDropContext>

            {requests.some((request) => request.is_blocked) && (
                <p className="text-center text-[11px] text-zinc-500">
                    Blocked tasks stay in their status column with a red blocked indicator.
                </p>
            )}
        </div>
    );
}
