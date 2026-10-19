import React, { ReactNode } from 'react';

export type StatusType =
    | 'new'
    | 'backlog'
    | 'ready'
    | 'todo'
    | 'doing'
    | 'in_progress'
    | 'review'
    | 'done'
    | 'cancelled'
    | (string & {});

interface StatusConfig {
    container: string;
    dot: string;
    defaultLabel: string;
}

const statusConfigs: Record<string, StatusConfig> = {
    new: {
        container: 'bg-zinc-800/60 text-zinc-300 border-zinc-750',
        dot: 'bg-zinc-400',
        defaultLabel: 'New',
    },
    backlog: {
        container: 'bg-zinc-800/60 text-zinc-300 border-zinc-750',
        dot: 'bg-zinc-400',
        defaultLabel: 'Backlog',
    },
    ready: {
        container: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
        dot: 'bg-blue-400',
        defaultLabel: 'Ready',
    },
    todo: {
        container: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
        dot: 'bg-blue-400',
        defaultLabel: 'To Do',
    },
    doing: {
        container: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
        dot: 'bg-amber-400 animate-pulse',
        defaultLabel: 'In Progress',
    },
    in_progress: {
        container: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
        dot: 'bg-amber-400 animate-pulse',
        defaultLabel: 'In Progress',
    },
    review: {
        container: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
        dot: 'bg-violet-400',
        defaultLabel: 'In Review',
    },
    done: {
        container: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
        dot: 'bg-emerald-400',
        defaultLabel: 'Done',
    },
    cancelled: {
        container: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
        dot: 'bg-rose-400',
        defaultLabel: 'Cancelled',
    },
};

const defaultFallbackConfig: StatusConfig = {
    container: 'bg-zinc-800/60 text-zinc-300 border-zinc-750',
    dot: 'bg-zinc-400',
    defaultLabel: 'Unknown',
};

function formatStatus(status: string): string {
    return status
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface StatusBadgeProps {
    status?: StatusType;
    label?: string;
    dot?: boolean;
    className?: string;
    children?: ReactNode;
}

export default function StatusBadge({
    status = 'new',
    label,
    dot = true,
    className = '',
    children,
}: StatusBadgeProps) {
    const normalizedKey = status.toLowerCase();
    const config = statusConfigs[normalizedKey] ?? {
        ...defaultFallbackConfig,
        defaultLabel: formatStatus(status),
    };

    const displayLabel = children ?? label ?? config.defaultLabel;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-md transition-all ${config.container} ${className}`}
        >
            {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />}
            <span>{displayLabel}</span>
        </span>
    );
}
