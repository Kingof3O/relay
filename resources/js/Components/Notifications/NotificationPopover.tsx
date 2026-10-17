import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Bell,
    Check,
    CheckCheck,
    ArrowRightLeft,
    UserCheck,
    MessageSquare,
    AlertTriangle,
    Sparkles,
    ArrowRight,
    Inbox,
} from 'lucide-react';

type NotificationItem = {
    id: string;
    read_at?: string | null;
    event?: string;
    request_id?: number;
    request_title?: string;
    message?: string;
    url?: string;
    created_at?: string | null;
};

function formatRelativeTime(dateString?: string | null): string {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getNotificationIcon(item: NotificationItem) {
    const text = `${item.event ?? ''} ${item.message ?? ''}`.toLowerCase();
    if (text.includes('status') || text.includes('moved')) {
        return <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />;
    }
    if (text.includes('assign') || text.includes('owner')) {
        return <UserCheck className="h-3.5 w-3.5 text-violet-400" />;
    }
    if (text.includes('comment') || text.includes('message')) {
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />;
    }
    if (text.includes('block')) {
        return <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />;
    }
    return <Sparkles className="h-3.5 w-3.5 text-amber-400" />;
}

export default function NotificationPopover() {
    const props = usePage().props as any;
    const initialList: NotificationItem[] = props.workspaceNotifications ?? [];
    const initialUnread: number =
        props.unreadNotificationsCount ?? initialList.filter((n) => !n.read_at).length;

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialList);
    const [unreadCount, setUnreadCount] = useState<number>(initialUnread);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync state when Inertia reloads props
    useEffect(() => {
        setNotifications(props.workspaceNotifications ?? []);
        setUnreadCount(
            props.unreadNotificationsCount ??
                (props.workspaceNotifications ?? []).filter((n: any) => !n.read_at).length
        );
    }, [props.workspaceNotifications, props.unreadNotificationsCount]);

    // Handle clicks outside container and Escape key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    // Mark all notifications as read
    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setUnreadCount(0);
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))
        );

        try {
            await axios.post(route('notifications.read-all'));
        } catch {
            // Silently fall back
        }
    };

    // Mark individual notification as read
    const handleMarkSingleRead = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
            prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
        );

        try {
            await axios.post(route('notifications.read', id));
        } catch {
            // Silently fall back
        }
    };

    // Click on a notification item: mark as read and navigate
    const handleItemClick = (item: NotificationItem) => {
        if (!item.read_at) {
            handleMarkSingleRead(item.id);
        }
        setOpen(false);
        const targetUrl = item.url ?? (item.request_id ? route('requests.show', item.request_id) : route('requests.index'));
        router.visit(targetUrl);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Popover Trigger Bell Button */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-150 ${
                    open
                        ? 'border-zinc-700 bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                        : 'border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm hover:border-zinc-700 hover:text-white'
                }`}
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                aria-expanded={open}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold font-mono text-white shadow-md">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu Overlay */}
            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[380px] sm:w-[420px] rounded-2xl border border-zinc-800 bg-[#0e1015]/95 shadow-2xl backdrop-blur-2xl ring-1 ring-white/[0.05] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3.5 bg-zinc-900/40">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-100">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300 font-mono">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-750 hover:bg-zinc-800 hover:text-zinc-200"
                                title="Mark all as read"
                            >
                                <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                                <span>Mark all as read</span>
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[380px] overflow-y-auto custom-scroll divide-y divide-zinc-850/60">
                        {notifications.length > 0 ? (
                            notifications.map((item) => {
                                const isUnread = !item.read_at;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`group relative flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                                            isUnread
                                                ? 'bg-blue-500/[0.04] hover:bg-zinc-850/70 border-l-2 border-l-blue-500'
                                                : 'opacity-75 hover:opacity-100 hover:bg-zinc-850/50 border-l-2 border-l-transparent'
                                        }`}
                                    >
                                        {/* Event Icon container */}
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-[#14161f]">
                                            {getNotificationIcon(item)}
                                        </div>

                                        {/* Notification Text */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-xs font-semibold text-zinc-200 group-hover:text-white">
                                                    {item.request_title ?? 'Work Request Update'}
                                                </p>
                                                <span className="shrink-0 text-[10px] text-zinc-500 font-mono">
                                                    {formatRelativeTime(item.created_at)}
                                                </span>
                                            </div>

                                            {item.message && (
                                                <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-zinc-400">
                                                    {item.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Unread indicator & Quick Mark As Read button on Hover */}
                                        <div className="flex shrink-0 items-center self-center pl-1">
                                            {isUnread ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleMarkSingleRead(item.id, e)}
                                                    className="flex h-5 w-5 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-700/60 hover:text-zinc-200 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <span className="group-hover:hidden h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                                                    <Check className="hidden group-hover:block h-3.5 w-3.5 text-zinc-300" />
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-[#14161f] text-zinc-500 mb-3 shadow-inner">
                                    <Inbox className="h-6 w-6 text-zinc-400" />
                                </div>
                                <p className="text-sm font-semibold text-zinc-200">All caught up</p>
                                <p className="mt-1 text-xs text-zinc-500 max-w-[240px]">
                                    You don't have any notifications right now.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-800/80 bg-zinc-900/40 px-4 py-2.5">
                        <Link
                            href={route('notifications.index')}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                        >
                            <span>Open full notifications inbox</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
