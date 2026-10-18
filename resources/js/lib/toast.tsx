import { ReactNode } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Sparkles, ArrowRightLeft, X } from 'lucide-react';

interface ToastPillProps {
    id: string | number;
    icon: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'undo';
    };
}

function ToastPill({ id, icon, title, description, action }: ToastPillProps) {
    return (
        <div className="relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090a0f]/95 p-3.5 text-zinc-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.9)] shadow-specular backdrop-blur-xl ring-1 ring-white/[0.04]">
            {/* Specular top light */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex shrink-0 items-center justify-center">
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-100 leading-snug">{title}</p>
                {description && (
                    <p className="mt-0.5 text-[11px] text-zinc-400 leading-snug">{description}</p>
                )}
            </div>

            {action && (
                <button
                    type="button"
                    onClick={() => {
                        action.onClick();
                        toast.dismiss(id);
                    }}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
                        action.variant === 'undo'
                            ? 'border border-amber-500/30 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 hover:text-amber-200'
                            : 'border border-violet-500/40 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 hover:text-white'
                    }`}
                >
                    {action.label}
                </button>
            )}

            <button
                type="button"
                onClick={() => toast.dismiss(id)}
                className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300"
                aria-label="Dismiss toast"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export function notifySuccess(title: string, description?: string) {
    return toast.custom((id) => (
        <ToastPill
            id={id}
            title={title}
            description={description}
            icon={
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                </div>
            }
        />
    ));
}

export function notifyError(title: string, description?: string) {
    return toast.custom((id) => (
        <ToastPill
            id={id}
            title={title}
            description={description}
            icon={
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="h-4 w-4" />
                </div>
            }
        />
    ));
}

export function notifyAction(
    title: string,
    actionLabel: string,
    onAction: () => void,
    description?: string
) {
    return toast.custom((id) => (
        <ToastPill
            id={id}
            title={title}
            description={description}
            action={{ label: actionLabel, onClick: onAction, variant: 'primary' }}
            icon={
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-400">
                    <Sparkles className="h-4 w-4" />
                </div>
            }
        />
    ));
}

export function notifyUndo(
    title: string,
    onUndo: () => void,
    description?: string
) {
    return toast.custom((id) => (
        <ToastPill
            id={id}
            title={title}
            description={description}
            action={{ label: 'Undo', onClick: onUndo, variant: 'undo' }}
            icon={
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
                    <ArrowRightLeft className="h-4 w-4" />
                </div>
            }
        />
    ));
}

export { toast };
export default toast;
