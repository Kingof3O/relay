import { AlertTriangle, Check, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { RequestRelationItem } from '@/types/workspace';

interface RequestBlockerBannerProps {
    isBlocked: boolean;
    blockedReason?: string | null;
    canEdit: boolean;
    onResolve: () => Promise<void> | void;
    relations?: RequestRelationItem[];
}

export default function RequestBlockerBanner({
    isBlocked,
    blockedReason,
    canEdit,
    onResolve,
    relations = [],
}: RequestBlockerBannerProps) {
    if (!isBlocked) return null;

    const blockers = relations.filter((r) => r.type === 'blocks');

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-specular">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                            Blocked Task
                        </h3>
                        <p className="mt-0.5 text-xs text-zinc-200">
                            {blockedReason || 'This task is flagged as blocked waiting for dependencies or sign-off.'}
                        </p>
                    </div>
                </div>

                {canEdit && (
                    <button
                        type="button"
                        onClick={onResolve}
                        className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-200 shadow-sm transition-all hover:bg-amber-500/30 active:scale-95"
                    >
                        <Check className="h-3.5 w-3.5" />
                        <span>Unblock Task</span>
                    </button>
                )}
            </div>

            {blockers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-amber-500/20 pt-2.5">
                    <span className="text-[11px] font-semibold text-amber-400">Blocked by:</span>
                    {blockers.map((blocker) => (
                        <Link
                            key={blocker.id}
                            href={route('requests.show', blocker.related_id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200 transition-colors hover:border-amber-400 hover:bg-amber-500/20"
                        >
                            <span className="font-mono font-bold">#REQ-{blocker.related_id}</span>
                            {blocker.related?.title && (
                                <span className="max-w-[200px] truncate text-zinc-300">
                                    {blocker.related.title}
                                </span>
                            )}
                            {blocker.related?.status_label && (
                                <span className="rounded bg-black/40 px-1 text-[9px] text-amber-300">
                                    {blocker.related.status_label}
                                </span>
                            )}
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
