import Card from '@/Components/Card';
import { WorkRequestCard, WorkRequestDetail } from '@/types/workspace';
import { CheckCircle2, Circle, Plus, Trash2, CheckSquare, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface RequestSubtasksSectionProps {
    request: WorkRequestDetail;
    canEdit: boolean;
    onSubtasksChange: (updatedRequest: WorkRequestDetail) => void;
}

export default function RequestSubtasksSection({
    request,
    canEdit,
    onSubtasksChange,
}: RequestSubtasksSectionProps) {
    const [subtaskTitle, setSubtaskTitle] = useState('');
    const [creating, setCreating] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const subtasks = request.subtasks ?? [];
    const totalCount = subtasks.length;
    const completedCount = subtasks.filter((s) => s.status === 'done').length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleCreateSubtask = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = subtaskTitle.trim();
        if (!trimmed) return;

        setCreating(true);
        try {
            const { data } = await axios.post(
                route('requests.subtasks.store', request.id),
                { title: trimmed },
                { headers: { Accept: 'application/json' } }
            );

            setSubtaskTitle('');
            toast.success('Sub-task created');
            if (data.request) {
                onSubtasksChange(data.request);
            }
        } catch (err: unknown) {
            const msg = isAxiosError(err)
                ? (err.response?.data?.message ?? 'Could not create sub-task.')
                : 'Could not create sub-task.';
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    };

    const handleToggleSubtask = async (subtaskId: number) => {
        setTogglingId(subtaskId);
        try {
            const { data } = await axios.post(
                route('requests.subtasks.toggle', [request.id, subtaskId]),
                {},
                { headers: { Accept: 'application/json' } }
            );

            if (data.request) {
                onSubtasksChange(data.request);
            }
        } catch (err: unknown) {
            const msg = isAxiosError(err)
                ? (err.response?.data?.message ?? 'Could not toggle sub-task.')
                : 'Could not toggle sub-task.';
            toast.error(msg);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDeleteSubtask = async (subtaskId: number) => {
        try {
            const { data } = await axios.delete(
                route('requests.subtasks.destroy', [request.id, subtaskId]),
                { headers: { Accept: 'application/json' } }
            );

            toast.success('Sub-task deleted');
            if (data.request) {
                onSubtasksChange(data.request);
            }
        } catch (err: unknown) {
            const msg = isAxiosError(err)
                ? (err.response?.data?.message ?? 'Could not delete sub-task.')
                : 'Could not delete sub-task.';
            toast.error(msg);
        }
    };

    return (
        <Card className="p-5 space-y-4">
            {/* Header with Title and Progress Ring */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-violet-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Sub-tasks
                    </h2>
                    {totalCount > 0 && (
                        <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                            {completedCount}/{totalCount}
                        </span>
                    )}
                </div>

                {totalCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                                className="h-full bg-violet-500 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">
                            {percentage}%
                        </span>
                    </div>
                )}
            </div>

            {/* List of Subtasks */}
            <div className="space-y-1.5">
                {subtasks.length > 0 ? (
                    subtasks.map((subtask) => {
                        const isDone = subtask.status === 'done';
                        const isToggling = togglingId === subtask.id;

                        return (
                            <div
                                key={subtask.id}
                                className={`group flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-all ${
                                    isDone
                                        ? 'border-white/[0.04] bg-white/[0.01] text-zinc-500'
                                        : 'border-white/[0.07] bg-[#0c0d12] hover:border-zinc-700 text-zinc-200'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <button
                                        type="button"
                                        disabled={!canEdit || isToggling}
                                        onClick={() => handleToggleSubtask(subtask.id)}
                                        className="shrink-0 transition-transform active:scale-95"
                                        title={isDone ? 'Mark incomplete' : 'Mark complete'}
                                    >
                                        {isDone ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
                                        )}
                                    </button>

                                    <Link
                                        href={route('requests.show', subtask.id)}
                                        className={`truncate text-xs font-medium hover:underline ${
                                            isDone ? 'line-through text-zinc-500' : 'text-zinc-200 hover:text-white'
                                        }`}
                                    >
                                        {subtask.title}
                                    </Link>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {subtask.story_points !== null && subtask.story_points !== undefined && (
                                        <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-mono text-violet-300">
                                            {subtask.story_points} pts
                                        </span>
                                    )}

                                    {subtask.assignee && (
                                        <div
                                            className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-200"
                                            title={subtask.assignee.name}
                                        >
                                            {subtask.assignee.name.charAt(0)}
                                        </div>
                                    )}

                                    {canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSubtask(subtask.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-all"
                                            title="Delete sub-task"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-[11px] text-zinc-500 py-1">
                        No sub-tasks yet. Decompose this issue into small, focused checklist items below.
                    </p>
                )}
            </div>

            {/* Fast Inline Input */}
            {canEdit && (
                <form onSubmit={handleCreateSubtask} className="flex items-center gap-2 pt-1">
                    <input
                        type="text"
                        placeholder="Add a sub-task (press Enter to save)..."
                        value={subtaskTitle}
                        onChange={(e) => setSubtaskTitle(e.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                        type="submit"
                        disabled={creating || !subtaskTitle.trim()}
                        className="flex h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-zinc-200 hover:border-violet-400 hover:bg-violet-500/10 hover:text-white disabled:opacity-40 transition-colors shrink-0"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add</span>
                    </button>
                </form>
            )}
        </Card>
    );
}
