type BadgeVariant = 'violet' | 'emerald' | 'rose' | 'zinc' | 'fuchsia' | 'indigo' | 'amber' | 'cyan' | 'orange' | 'blue';

export type StatusKey =
    | 'new'
    | 'in_progress'
    | 'waiting_for_reply'
    | 'needs_info'
    | 'needs_changes'
    | 'partially_done'
    | 'done';

export type StatusMeta = {
    label: string;
    badge: BadgeVariant;
    hex: string;
    dot: string;
    text: string;
};

export const STATUS_META: Record<StatusKey, StatusMeta> = {
    new: {
        label: 'New',
        badge: 'violet',
        hex: '#8b5cf6',
        dot: 'bg-violet-400',
        text: 'text-violet-300',
    },
    in_progress: {
        label: 'In progress',
        badge: 'blue',
        hex: '#60a5fa',
        dot: 'bg-blue-400',
        text: 'text-blue-300',
    },
    waiting_for_reply: {
        label: 'Waiting for reply',
        badge: 'amber',
        hex: '#fbbf24',
        dot: 'bg-amber-400',
        text: 'text-amber-300',
    },
    needs_info: {
        label: 'Needs info',
        badge: 'indigo',
        hex: '#818cf8',
        dot: 'bg-indigo-400',
        text: 'text-indigo-300',
    },
    needs_changes: {
        label: 'Needs changes',
        badge: 'rose',
        hex: '#fb7185',
        dot: 'bg-rose-400',
        text: 'text-rose-300',
    },
    partially_done: {
        label: 'Partially done',
        badge: 'orange',
        hex: '#fb923c',
        dot: 'bg-orange-400',
        text: 'text-orange-300',
    },
    done: {
        label: 'Done',
        badge: 'emerald',
        hex: '#34d399',
        dot: 'bg-emerald-400',
        text: 'text-emerald-300',
    },
};

export function statusMeta(status: string): StatusMeta {
    return STATUS_META[status as StatusKey] ?? {
        label: toTitle(status),
        badge: 'zinc' as BadgeVariant,
        hex: '#a1a1aa',
        dot: 'bg-zinc-400',
        text: 'text-zinc-300',
    };
}

export function toTitle(value: string): string {
    return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
