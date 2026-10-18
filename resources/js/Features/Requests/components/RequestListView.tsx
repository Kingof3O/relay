import React from 'react';
import Badge from '@/Components/Badge';
import { WorkRequestCard } from '@/types/workspace';
import { getChecklistStats } from '@/Components/MarkdownViewer';
import {
    Paperclip,
    Play,
    Send,
    Check,
    AlertTriangle,
    ChevronUp,
    ChevronDown,
} from 'lucide-react';

interface RequestListViewProps {
    requests: WorkRequestCard[];
    onSelectRequest: (request: WorkRequestCard) => void;
    onQuickStatus?: (request: WorkRequestCard, nextStatus: string) => void;
    selectedIds?: Set<number>;
    onToggleSelect?: (id: number) => void;
    onSelectAll?: (ids: number[]) => void;
}

const statusTone: Record<string, 'violet' | 'blue' | 'amber' | 'emerald' | 'zinc'> = {
    new: 'zinc',
    ready: 'blue',
    doing: 'amber',
    review: 'violet',
    done: 'emerald',
};

export default function RequestListView({
    requests,
    onSelectRequest,
    onQuickStatus,
    selectedIds = new Set(),
    onToggleSelect,
    onSelectAll,
}: RequestListViewProps) {
    const isAllSelected = requests.length > 0 && requests.every((r) => selectedIds.has(r.id));

    const handleSelectAllToggle = () => {
        if (!onSelectAll) return;
        if (isAllSelected) {
            onSelectAll([]);
        } else {
            onSelectAll(requests.map((r) => r.id));
        }
    };

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#0e1015] shadow-xl">
            <div className="overflow-x-auto custom-scroll">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            <th className="py-3 px-4 w-10 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAllToggle}
                                    className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                />
                            </th>
                            <th className="py-3 px-3 w-28">Status</th>
                            <th className="py-3 px-3">Title & Tasks</th>
                            <th className="py-3 px-3 w-40">Project</th>
                            <th className="py-3 px-3 w-28">Due Date</th>
                            <th className="py-3 px-3 w-36">Tags</th>
                            <th className="py-3 px-3 w-28">Priority</th>
                            <th className="py-3 px-3 w-36">Assignee</th>
                            <th className="py-3 px-3 w-28 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60">
                        {requests.length > 0 ? (
                            requests.map((req) => {
                                const isSelected = selectedIds.has(req.id);
                                const checklist = getChecklistStats(req.description);

                                const nextAction =
                                    req.status === 'ready'
                                        ? { label: 'Start', icon: Play, next: 'doing', color: 'text-blue-300 hover:bg-blue-950/40 border-blue-800/60' }
                                        : req.status === 'doing'
                                        ? { label: 'Review', icon: Send, next: 'review', color: 'text-violet-300 hover:bg-violet-950/40 border-violet-800/60' }
                                        : req.status === 'review'
                                        ? { label: 'Approve', icon: Check, next: 'done', color: 'text-emerald-300 hover:bg-emerald-950/40 border-emerald-800/60' }
                                        : null;

                                return (
                                    <tr
                                        key={req.id}
                                        onClick={() => onSelectRequest(req)}
                                        className={`group cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'bg-blue-500/[0.08] hover:bg-blue-500/[0.12]'
                                                : 'hover:bg-zinc-850/50'
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <td
                                            className="py-3 px-4 text-center"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onToggleSelect) onToggleSelect(req.id);
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleSelect && onToggleSelect(req.id)}
                                                className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                            />
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-3">
                                            <Badge
                                                variant={statusTone[req.status] ?? 'zinc'}
                                                className="text-[10px] font-medium"
                                            >
                                                {req.status_label ?? req.status}
                                            </Badge>
                                        </td>

                                        {/* Title & Checklist info */}
                                        <td className="py-3 px-3 min-w-[240px]">
                                            <div className="flex items-center gap-2">
                                                {req.is_blocked && (
                                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                                                )}
                                                <span className="font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                                                    {req.title}
                                                </span>
                                                {req.files_count ? (
                                                    <span className="flex items-center gap-0.5 text-[10px] text-zinc-500">
                                                        <Paperclip className="h-3 w-3" />
                                                        {req.files_count}
                                                    </span>
                                                ) : null}
                                            </div>

                                            {checklist && (
                                                <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500">
                                                    <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${checklist.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span>
                                                        {checklist.completed}/{checklist.total} tasks
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Initiative */}
                                        <td className="py-3 px-3">
                                            {req.project ? (
                                                <span className="inline-flex items-center gap-1.5 truncate rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: req.project.color ?? '#71717a' }}
                                                    />
                                                    <span className="truncate">{req.project.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-zinc-500">No project</span>
                                            )}
                                        </td>

                                        {/* Due Date */}
                                        <td className="py-3 px-3">
                                            {req.due_date ? (
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                                                        req.is_overdue
                                                            ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                                                            : req.due_human === 'Due today'
                                                            ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                                            : 'border-zinc-700/50 bg-zinc-800/80 text-zinc-400'
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            req.is_overdue
                                                                ? 'bg-rose-400'
                                                                : req.due_human === 'Due today'
                                                                ? 'bg-amber-400'
                                                                : 'bg-zinc-500'
                                                        }`}
                                                    />
                                                    <span className="truncate">{req.due_human ?? req.due_date}</span>
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-zinc-600">-</span>
                                            )}
                                        </td>

                                        {/* Tags */}
                                        <td className="py-3 px-3">
                                            {req.tags && req.tags.length > 0 ? (
                                                <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
                                                    {req.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] px-1.5 py-0.5 rounded"
                                                        >
                                                            {tag.startsWith('#') ? tag : `#${tag}`}
                                                        </span>
                                                    ))}
                                                    {req.tags.length > 3 && (
                                                        <span className="text-[10px] text-zinc-500">+{req.tags.length - 3}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-zinc-600">-</span>
                                            )}
                                        </td>

                                        {/* Priority */}
                                        <td className="py-3 px-3">
                                            <Badge
                                                variant={req.priority === 'urgent' ? 'rose' : 'zinc'}
                                                dot={req.priority === 'urgent'}
                                                className="text-[10px]"
                                            >
                                                {req.priority_label}
                                            </Badge>
                                        </td>

                                        {/* Assignee */}
                                        <td className="py-3 px-3">
                                            {req.assignee ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-200 shrink-0">
                                                        {req.assignee.name.charAt(0)}
                                                    </div>
                                                    <span className="truncate text-zinc-300 text-[11px]">
                                                        {req.assignee.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-500 text-[11px]">Unassigned</span>
                                            )}
                                        </td>

                                        {/* Quick Action Button */}
                                        <td className="py-3 px-3 text-right">
                                            {nextAction && onQuickStatus && !req.is_blocked && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onQuickStatus(req, nextAction.next);
                                                    }}
                                                    className={`inline-flex items-center gap-1 rounded-md border bg-zinc-900 px-2 py-1 text-[10px] font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${nextAction.color}`}
                                                >
                                                    <nextAction.icon className="h-2.5 w-2.5" />
                                                    <span>{nextAction.label}</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={9} className="py-12 text-center text-zinc-500">
                                    No requests found in this view.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
