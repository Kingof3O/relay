import { AlertTriangle, Check } from 'lucide-react';

interface RequestBlockerBannerProps {
    isBlocked: boolean;
    blockedReason?: string | null;
    canEdit: boolean;
    onResolve: () => Promise<void> | void;
}

export default function RequestBlockerBanner({
    isBlocked,
    blockedReason,
    canEdit,
    onResolve,
}: RequestBlockerBannerProps) {
    if (!isBlocked) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-specular">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        Roadblock / Stalled Issue
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
                    <span>Resolve Blocker</span>
                </button>
            )}
        </div>
    );
}
