import { WorkRequestCard } from '@/types/workspace';
import { Link } from '@inertiajs/react';
import { ArrowRight, Check, ShieldAlert } from 'lucide-react';

interface RoadblockAlertBannerProps {
    blockedRequests: WorkRequestCard[];
    onUnblockLatest?: (request: WorkRequestCard) => void;
}

export default function RoadblockAlertBanner({
    blockedRequests,
    onUnblockLatest,
}: RoadblockAlertBannerProps) {
    if (!blockedRequests || blockedRequests.length === 0) {
        return null;
    }

    const latest = blockedRequests[0];

    return (
        <div className="relative rounded-xl border border-rose-900/50 bg-[#161214] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-400">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-semibold text-rose-200">
                                {blockedRequests.length} Active {blockedRequests.length === 1 ? 'Roadblock' : 'Roadblocks'}
                            </h4>
                            <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">
                                Action Required
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                            Latest: <strong className="text-zinc-200">{latest.title}</strong> — {latest.blocked_reason || 'Requires unblocking resolution'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onUnblockLatest && (
                        <button
                            type="button"
                            onClick={() => onUnblockLatest(latest)}
                            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span>Unblock Latest</span>
                        </button>
                    )}
                    <Link
                        href={route('requests.index', { blocked: '1' })}
                        className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-850 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                    >
                        <span>View All Blockers</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
