import Badge from '@/Components/Badge';
import { WorkRequestCard } from '@/types/workspace';
import { Link, router } from '@inertiajs/react';
import { AlertTriangle, Paperclip, Play, Send, Check, Copy } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { getChecklistStats } from '@/Components/MarkdownViewer';
import { toast } from 'sonner';

const statusTone: Record<string, 'violet' | 'blue' | 'amber' | 'emerald' | 'zinc'> = {
    new: 'zinc',
    ready: 'blue',
    doing: 'amber',
    review: 'violet',
    done: 'emerald',
};

export default function RequestCard({
    request,
    index,
    onQuickStatus,
    onOpenDrawer,
    isSelected = false,
    onToggleSelect,
    isKeyboardFocused = false,
}: {
    request: WorkRequestCard;
    index: number;
    onQuickStatus?: (request: WorkRequestCard, nextStatus: string) => void;
    onOpenDrawer?: (request: WorkRequestCard) => void;
    isSelected?: boolean;
    onToggleSelect?: (id: number) => void;
    isKeyboardFocused?: boolean;
}) {
    const checklist = getChecklistStats(request.description);

    const nextAction =
        request.status === 'ready'
            ? {
                  label: 'Start',
                  icon: Play,
                  iconClass: 'fill-current',
                  next: 'doing',
                  color: 'border-zinc-750 bg-zinc-850/90 text-zinc-300 hover:border-blue-500/50 hover:bg-blue-950/40 hover:text-blue-200',
              }
            : request.status === 'doing'
            ? {
                  label: 'Review',
                  icon: Send,
                  iconClass: '',
                  next: 'review',
                  color: 'border-zinc-750 bg-zinc-850/90 text-zinc-300 hover:border-violet-500/50 hover:bg-violet-950/40 hover:text-violet-200',
              }
            : request.status === 'review'
            ? {
                  label: 'Approve',
                  icon: Check,
                  iconClass: 'stroke-[2.5]',
                  next: 'done',
                  color: 'border-emerald-800/60 bg-emerald-950/20 text-emerald-300 hover:border-emerald-600/80 hover:bg-emerald-950/50 hover:text-emerald-100',
              }
            : null;

    return (
        <Draggable draggableId={String(request.id)} index={index}>
            {(provided, snapshot) => {
                const baseTransform = provided.draggableProps.style?.transform;
                // Augment transform without breaking hello-pangea-dnd's internal translate coordinates
                const transform =
                    snapshot.isDragging && baseTransform
                        ? `${baseTransform} rotate(1.2deg) scale(1.025)`
                        : baseTransform;

                const cardStyle = {
                    ...provided.draggableProps.style,
                    transform,
                    // Disable CSS transition during drag to prevent jitter and mouse-lag
                    transition: snapshot.isDragging
                        ? undefined
                        : 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                    cursor: snapshot.isDragging ? 'grabbing' : 'pointer',
                };

                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={cardStyle}
                        onClick={(e) => {
                            if (snapshot.isDragging) return;
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('a') || target.closest('input')) {
                                return;
                            }
                            if (onOpenDrawer) {
                                onOpenDrawer(request);
                            } else {
                                router.visit(route('requests.show', request.id));
                            }
                        }}
                        id={`kanban-card-${request.id}`}
                        className={`group relative mb-2.5 rounded-xl border p-3.5 select-none transition-all duration-150 ${
                            snapshot.isDragging
                                ? 'border-zinc-500 bg-[#16171f] shadow-2xl shadow-black/80 ring-1 ring-white/20 z-50'
                                : isKeyboardFocused
                                ? 'border-violet-500/80 bg-[#181926] ring-2 ring-violet-500/60 shadow-lg shadow-violet-500/10 z-20'
                                : isSelected
                                ? 'border-blue-500/80 bg-blue-950/20 shadow-md ring-1 ring-blue-500/30'
                                : 'border-white/[0.07] bg-[#111216] hover:border-zinc-700 hover:bg-[#14151a]'
                        }`}
                    >
                        {/* Selection Checkbox */}
                        {onToggleSelect && (
                            <div
                                className={`absolute left-2.5 top-2.5 z-10 transition-opacity ${
                                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(request.id);
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onToggleSelect(request.id)}
                                    className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer shadow-sm"
                                />
                            </div>
                        )}

                        {/* Title & Priority Header */}
                        <div className={`flex items-start justify-between gap-2.5 ${onToggleSelect && isSelected ? 'pl-4' : ''}`}>
                            <p
                                onClick={(e) => {
                                    if (onOpenDrawer) {
                                        e.preventDefault();
                                        onOpenDrawer(request);
                                    }
                                }}
                                className="line-clamp-2 text-xs font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-white"
                            >
                                {request.title}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {request.story_points !== null && request.story_points !== undefined && (
                                    <span
                                        className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-violet-300 shadow-sm"
                                        title={`${request.story_points} Story Points`}
                                    >
                                        {request.story_points} pts
                                    </span>
                                )}
                                {request.rolled_over_from_cycle_id && (
                                    <span
                                        className="rounded border border-amber-500/30 bg-amber-500/10 px-1 py-0.5 text-[9px] font-semibold text-amber-300"
                                        title="Rolled over from previous cycle"
                                    >
                                        Rolled
                                    </span>
                                )}
                                <Badge
                                    variant={
                                        request.priority === 'urgent'
                                            ? 'rose'
                                            : statusTone[request.status] ?? 'zinc'
                                    }
                                    dot={request.priority === 'urgent'}
                                    className="shrink-0"
                                >
                                    {request.priority === 'urgent' ? 'Urgent' : request.priority_label}
                                </Badge>
                            </div>
                        </div>

                        {request.description && (
                            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                                {request.description}
                            </p>
                        )}

                        {/* Hierarchical Subtasks Micro Completion Ring */}
                        {request.subtasks_progress && request.subtasks_progress.total > 0 && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-zinc-400">
                                <div className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                                    <svg className="h-3.5 w-3.5 -rotate-90 transform" viewBox="0 0 32 32">
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="12"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            className="text-zinc-800"
                                            fill="transparent"
                                        />
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="12"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeDasharray={2 * Math.PI * 12}
                                            strokeDashoffset={2 * Math.PI * 12 * (1 - (request.subtasks_progress.percentage / 100))}
                                            strokeLinecap="round"
                                            className="text-violet-400 transition-all duration-300"
                                            fill="transparent"
                                        />
                                    </svg>
                                </div>
                                <span className="font-mono text-zinc-300">
                                    {request.subtasks_progress.completed}/{request.subtasks_progress.total}
                                </span>
                                <span className="text-zinc-500">done</span>
                            </div>
                        )}

                        {/* Checklist Micro Progress Pill */}
                        {checklist && !request.subtasks_progress?.total && (
                            <div className="mt-2.5 flex items-center gap-2 text-[10px] text-zinc-400">
                                <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${checklist.percentage}%` }}
                                    />
                                </div>
                                <span className="font-mono">
                                    {checklist.completed}/{checklist.total}
                                </span>
                            </div>
                        )}

                        {/* Due Date & Tags */}
                        {((request.due_date && request.due_human) || (request.tags && request.tags.length > 0)) && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                {request.due_date && (
                                    <span
                                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                                            request.is_overdue
                                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                                                : request.due_human === 'Due today'
                                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                                : 'border-zinc-700/50 bg-zinc-800/80 text-zinc-400'
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                request.is_overdue
                                                    ? 'bg-rose-400'
                                                    : request.due_human === 'Due today'
                                                    ? 'bg-amber-400'
                                                    : 'bg-zinc-500'
                                            }`}
                                        />
                                        <span>{request.due_human ?? request.due_date}</span>
                                    </span>
                                )}
                                {request.tags?.map((tag) => (
                                    <span
                                        key={tag}
                                        className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] px-1.5 py-0.5 rounded"
                                    >
                                        {tag.startsWith('#') ? tag : `#${tag}`}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Card Footer: Project Badge & Action/Metadata */}
                        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-2.5 text-[11px]">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                {request.project ? (
                                    <span className="flex items-center gap-1.5 min-w-0 max-w-full truncate rounded-md border border-zinc-800 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">
                                        <span
                                            className="h-1.5 w-1.5 rounded-full shrink-0"
                                            style={{ backgroundColor: request.project.color ?? '#71717a' }}
                                        />
                                        <span className="truncate">{request.project.name}</span>
                                    </span>
                                ) : (
                                    <span className="truncate rounded-md border border-zinc-800 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                                        No project
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
                                {/* Quick 1-Click Status Advance on Hover */}
                                {nextAction && onQuickStatus && !request.is_blocked && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onQuickStatus(request, nextAction.next);
                                        }}
                                        className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium shadow-sm transition-all duration-150 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto cursor-pointer ${nextAction.color}`}
                                        title={`Move to ${nextAction.label}`}
                                    >
                                        <nextAction.icon className={`h-2.5 w-2.5 ${nextAction.iconClass}`} />
                                        <span>{nextAction.label}</span>
                                    </button>
                                )}

                                {/* Copy Link */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(`${window.location.origin}/requests/${request.id}`);
                                        toast.success('Link copied');
                                    }}
                                    className="hidden sm:inline-flex opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 transition-opacity p-0.5"
                                    title="Copy link"
                                >
                                    <Copy className="h-3 w-3" />
                                </button>

                                {request.files_count ? (
                                    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                                        <Paperclip className="h-3 w-3 text-zinc-500" />
                                        {request.files_count}
                                    </span>
                                ) : null}

                                {request.assignee ? (
                                    <div
                                        className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-200 shrink-0"
                                        title={request.assignee.name}
                                    >
                                        {request.assignee.name.charAt(0)}
                                    </div>
                                ) : (
                                    <span className="text-[10px] text-zinc-500 shrink-0">Unassigned</span>
                                )}
                            </div>
                        </div>

                        {request.is_blocked && (
                            <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-rose-900/50 bg-rose-950/20 px-2.5 py-1.5 text-[11px] text-rose-300">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
                                <span className="truncate font-medium">
                                    Blocked{request.blocked_reason ? ` · ${request.blocked_reason}` : ''}
                                </span>
                            </div>
                        )}
                    </div>
                );
            }}
        </Draggable>
    );
}
