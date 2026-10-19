import React, { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}>
            {Icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm mx-auto mb-3">
                    <Icon className="h-5 w-5 stroke-[1.75]" />
                </div>
            )}
            <h3 className="text-sm font-semibold text-zinc-200">{title}</h3>
            {description && (
                <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-4 flex items-center justify-center gap-2">
                    {action}
                </div>
            )}
        </div>
    );
}
