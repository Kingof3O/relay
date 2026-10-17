import {
    ArrowRightLeft,
    UserCheck,
    MessageSquare,
    AlertTriangle,
    Sparkles,
    type LucideIcon,
} from 'lucide-react';

export type NotificationItem = {
    id: string;
    read_at?: string | null;
    event?: string;
    request_id?: number | string;
    request_title?: string;
    message?: string;
    url?: string;
    created_at?: string | null;
    actor_name?: string;
    actor?: {
        id: number;
        name: string;
        avatar_url?: string;
    };
    [key: string]: any;
};

export type NotificationCategoryType = 'status' | 'assignment' | 'comment' | 'blocker' | 'general';

export interface NotificationBadgeInfo {
    category: NotificationCategoryType;
    label: string;
    icon: LucideIcon;
    pillClass: string;
    dotClass: string;
}

export function formatRelativeTime(dateString?: string | null): string {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 30) return 'Just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function getNotificationBadge(item: { event?: string; message?: string }): NotificationBadgeInfo {
    const event = (item.event ?? '').toLowerCase();
    const msg = (item.message ?? '').toLowerCase();

    // Assignment: purple
    if (event === 'assignment' || msg.includes('assigned') || msg.includes('assignment') || msg.includes('owner')) {
        return {
            category: 'assignment',
            label: 'Assignment',
            icon: UserCheck,
            pillClass: 'bg-purple-500/10 text-purple-300 border-purple-500/25 shadow-[0_0_12px_rgba(168,85,247,0.12)]',
            dotClass: 'bg-purple-400',
        };
    }

    // Blocker: rose
    if (event === 'blocked' || msg.includes('blocked') || msg.includes('blocker')) {
        return {
            category: 'blocker',
            label: 'Blocker',
            icon: AlertTriangle,
            pillClass: 'bg-rose-500/10 text-rose-300 border-rose-500/25 shadow-[0_0_12px_rgba(244,63,94,0.12)]',
            dotClass: 'bg-rose-400',
        };
    }

    // Comment: emerald
    if (event === 'comment' || msg.includes('comment') || msg.includes('replied')) {
        return {
            category: 'comment',
            label: 'Comment',
            icon: MessageSquare,
            pillClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.12)]',
            dotClass: 'bg-emerald-400',
        };
    }

    // Status Change: blue / violet
    if (
        event === 'review' ||
        event === 'done' ||
        event === 'reopened' ||
        event === 'status_changed' ||
        msg.includes('status') ||
        msg.includes('moved') ||
        msg.includes('marked this request')
    ) {
        const label = event === 'review' ? 'In Review' : event === 'done' ? 'Completed' : 'Status Change';
        return {
            category: 'status',
            label,
            icon: ArrowRightLeft,
            pillClass: 'bg-blue-500/10 text-blue-300 border-blue-500/25 shadow-[0_0_12px_rgba(59,130,246,0.12)]',
            dotClass: 'bg-blue-400',
        };
    }

    // General: amber
    return {
        category: 'general',
        label: 'General',
        icon: Sparkles,
        pillClass: 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.12)]',
        dotClass: 'bg-amber-400',
    };
}
