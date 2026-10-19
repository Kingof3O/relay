import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'primary';
    loading?: boolean;
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    loading = false,
}: ConfirmDialogProps) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) {
                onClose();
            }
        },
        [onClose, loading]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [open, handleKeyDown]);

    if (!open) return null;

    const variantConfig = {
        danger: {
            icon: AlertTriangle,
            iconClass: 'text-rose-400',
            iconBg: 'bg-rose-500/10 border-rose-500/25',
            buttonClass:
                'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-900/30',
        },
        warning: {
            icon: AlertCircle,
            iconClass: 'text-amber-400',
            iconBg: 'bg-amber-500/10 border-amber-500/25',
            buttonClass:
                'bg-amber-600 hover:bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-900/30',
        },
        primary: {
            icon: HelpCircle,
            iconClass: 'text-violet-400',
            iconBg: 'bg-violet-500/10 border-violet-500/25',
            buttonClass:
                'bg-violet-600 hover:bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-900/30',
        },
    };

    const currentVariant = variantConfig[variant];
    const Icon = currentVariant.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={loading ? undefined : onClose}
                aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-2xl shadow-black/80">
                {/* Top specular highlight line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${currentVariant.iconBg} ${currentVariant.iconClass}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3
                            id="confirm-dialog-title"
                            className="text-base font-semibold text-white tracking-tight"
                        >
                            {title}
                        </h3>
                        <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onClose}
                        className="rounded-xl border border-zinc-800 bg-[#121318] px-4 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={onConfirm}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${currentVariant.buttonClass}`}
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>{confirmLabel}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
