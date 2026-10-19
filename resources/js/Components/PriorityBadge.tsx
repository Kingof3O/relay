import React, { ReactNode } from 'react';

export type PriorityType =
    | 'urgent'
    | 'high'
    | 'normal'
    | 'medium'
    | 'low'
    | (string & {});

interface PriorityConfig {
    container: string;
    dot: string;
    defaultLabel: string;
}

const priorityConfigs: Record<string, PriorityConfig> = {
    urgent: {
        container: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
        dot: 'bg-rose-400 animate-pulse',
        defaultLabel: 'Urgent',
    },
    high: {
        container: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
        dot: 'bg-amber-400',
        defaultLabel: 'High',
    },
    normal: {
        container: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
        dot: 'bg-blue-400',
        defaultLabel: 'Normal',
    },
    medium: {
        container: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
        dot: 'bg-blue-400',
        defaultLabel: 'Medium',
    },
    low: {
        container: 'bg-zinc-800/60 text-zinc-400 border-zinc-750',
        dot: 'bg-zinc-500',
        defaultLabel: 'Low',
    },
};

const defaultFallbackConfig: PriorityConfig = {
    container: 'bg-zinc-800/60 text-zinc-400 border-zinc-750',
    dot: 'bg-zinc-500',
    defaultLabel: 'Normal',
};

function formatPriority(priority: string): string {
    return priority
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface PriorityBadgeProps {
    priority?: PriorityType;
    label?: string;
    dot?: boolean;
    className?: string;
    children?: ReactNode;
}

export default function PriorityBadge({
    priority = 'normal',
    label,
    dot = true,
    className = '',
    children,
}: PriorityBadgeProps) {
    const normalizedKey = priority.toLowerCase();
    const config = priorityConfigs[normalizedKey] ?? {
        ...defaultFallbackConfig,
        defaultLabel: formatPriority(priority),
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
