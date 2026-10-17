import Badge from '@/Components/Badge';
import { WorkRequestDetail } from '@/types/workspace';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Play,
    Send,
    AlertTriangle,
    Check,
    Trash2,
    RefreshCw,
    Copy,
} from 'lucide-react';

interface RequestHeroHeaderProps {
    request: WorkRequestDetail;
    canEdit: boolean;
    canDelete: boolean;
    saving: boolean;
    onUpdate: (changes: Record<string, unknown>) => Promise<void> | void;
    onDelete: () => Promise<void> | void;
}

const pipelineStages = [
    { key: 'new', label: '1. New' },
    { key: 'ready', label: '2. Ready' },
    { key: 'doing', label: '3. Doing' },
    { key: 'review', label: '4. Review' },
    { key: 'done', label: '5. Done' },
];

const dateLabel = (date?: string | null) =>
    date
        ? new Intl.DateTimeFormat(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(date))
        : '';

export default function RequestHeroHeader({
    request,
    canEdit,
    canDelete,
    saving,
    onUpdate,
    onDelete,
}: RequestHeroHeaderProps) {
    const [copied, setCopied] = useState(false);
    const [duplicating, setDuplicating] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success('Ticket link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDuplicate = () => {
        if (!window.confirm(`Duplicate work request "#REQ-${request.id}"?`)) return;
        setDuplicating(true);
        router.post(route('requests.clone', request.id), {}, {
            onSuccess: () => {
                toast.success('Work request duplicated successfully');
            },
            onError: () => {
                toast.error('Failed to duplicate work request');
                setDuplicating(false);
            },
            onFinish: () => {
                setDuplicating(false);
            },
        });
    };

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1322]/80 p-5 shadow-specular backdrop-blur-xl sm:p-6 space-y-4">
            {/* Linear Pipeline Progress Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#07090e]/80 p-1">
                    {pipelineStages.map((st) => {
                        const active = request.status === st.key;
                        return (
                            <button
                                key={st.key}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => onUpdate({ status: st.key })}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                                    active
                                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-specular'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                {st.label}
                            </button>
                        );
                    })}
                </div>

                {/* 1-Click Stage Quick Actions */}
                <div className="flex items-center gap-2">
                    {request.status === 'ready' && canEdit && (
                        <button
                            type="button"
                            onClick={() => onUpdate({ status: 'doing' })}
                            className="flex items-center gap-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 px-3.5 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition-all shadow-specular"
                        >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Start Work</span>
                        </button>
                    )}

                    {request.status === 'doing' && canEdit && (
                        <>
                            <button
                                type="button"
                                onClick={() => onUpdate({ status: 'review' })}
                                className="flex items-center gap-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30 px-3.5 py-1.5 text-xs font-bold text-purple-200 hover:bg-purple-500/30 transition-all shadow-specular"
                            >
                                <Send className="h-3.5 w-3.5" />
                                <span>Submit for Review</span>
                            </button>

                            {!request.is_blocked && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const reason = window.prompt('Why is this task blocked?');
                                        if (reason) onUpdate({ is_blocked: true, blocked_reason: reason });
                                    }}
                                    className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-all"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>Flag Blocked</span>
                                </button>
                            )}
                        </>
                    )}

                    {request.status === 'review' && canEdit && (
                        <>
                            <button
                                type="button"
                                onClick={() => onUpdate({ status: 'done' })}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all shadow-specular"
                            >
                                <Check className="h-3.5 w-3.5" />
                                <span>Approve & Finish</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => onUpdate({ status: 'doing' })}
                                className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all"
                            >
                                <span>Request Changes</span>
                            </button>
                        </>
                    )}

                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 transition-colors hover:border-rose-400 hover:bg-rose-600 hover:text-white"
                            title="Delete ticket"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={request.priority === 'urgent' ? 'rose' : 'violet'}
                            dot={request.priority === 'urgent'}
                        >
                            {request.priority_label}
                        </Badge>
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-300">
                            {request.project?.name ?? 'No project'}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-zinc-400 hover:border-white/[0.15] hover:text-white transition-colors"
                            title="Copy ticket link"
                        >
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copied ? 'Copied' : 'Share'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleDuplicate}
                            disabled={duplicating}
                            className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-zinc-400 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300 transition-colors disabled:opacity-50"
                            title="Duplicate this ticket"
                        >
                            <Copy className="h-3 w-3 text-violet-400" />
                            <span>{duplicating ? 'Duplicating…' : 'Duplicate'}</span>
                        </button>
                    </div>

                    {canEdit ? (
                        <input
                            defaultValue={request.title}
                            onBlur={(event) => {
                                if (event.target.value.trim() && event.target.value !== request.title) {
                                    onUpdate({ title: event.target.value });
                                }
                            }}
                            className="mt-3 w-full min-w-[280px] border-0 border-b border-transparent bg-transparent px-0 text-2xl font-bold tracking-tight text-white outline-none transition-colors focus:border-violet-500 focus:ring-0 sm:text-3xl"
                            placeholder="Request title"
                        />
                    ) : (
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            {request.title}
                        </h1>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span>Created {dateLabel(request.created_at)}</span>
                        <span>·</span>
                        <span>Requester:</span>
                        <span className="font-semibold text-zinc-200">
                            {request.requester?.name ?? 'Unknown'}
                        </span>
                        {saving && (
                            <span className="flex items-center gap-1 text-[11px] text-cyan-300">
                                <RefreshCw className="h-3 w-3 animate-spin" /> Saving…
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
