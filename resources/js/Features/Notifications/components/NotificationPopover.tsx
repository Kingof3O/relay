import { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Bell,
    Check,
    CheckCheck,
    Mail,
    ArrowRight,
    Inbox,
    Layers,
} from 'lucide-react';
import {
    NotificationItem,
    formatRelativeTime,
    getNotificationBadge,
} from '../types';
import { notifySuccess } from '@/lib/toast';

export default function NotificationPopover() {
    const props = usePage().props as any;
    const initialList: NotificationItem[] = props.workspaceNotifications ?? [];
    const initialUnread: number =
        props.unreadNotificationsCount ?? initialList.filter((n) => !n.read_at).length;

    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<'all' | 'unread'>('all');
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialList);
    const [unreadCount, setUnreadCount] = useState<number>(initialUnread);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync state when Inertia reloads props
    useEffect(() => {
        const list = props.workspaceNotifications ?? [];
        setNotifications(list);
        setUnreadCount(
            props.unreadNotificationsCount ??
                list.filter((n: NotificationItem) => !n.read_at).length
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

        if (unreadCount === 0) return;

        setUnreadCount(0);
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))
        );

        try {
            await axios.post(route('notifications.read-all'));
            notifySuccess('All caught up', 'All notifications have been marked as read.');
        } catch {
            // Silently fall back
        }
    };

    // Toggle individual notification read/unread status
    const handleToggleRead = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const target = notifications.find((n) => n.id === id);
        if (!target) return;

        const isCurrentlyRead = Boolean(target.read_at);
        const newReadAt = isCurrentlyRead ? null : new Date().toISOString();

        setNotifications((prev) =>
            prev.map((item) => (item.id === id ? { ...item, read_at: newReadAt } : item))
        );
        setUnreadCount((prev) => (isCurrentlyRead ? prev + 1 : Math.max(0, prev - 1)));

        try {
            if (isCurrentlyRead) {
                await axios.post(route('notifications.unread', id));
            } else {
                await axios.post(route('notifications.read', id));
            }
        } catch {
            // Silently fall back
        }
    };

    // Click on a notification item: mark as read if unread and navigate
    const handleItemClick = (item: NotificationItem) => {
        if (!item.read_at) {
            handleToggleRead(item.id);
        }
        setOpen(false);
        const targetUrl =
            item.url ??
            (item.request_id ? route('requests.show', item.request_id) : route('requests.index'));
        router.visit(targetUrl);
    };

    const filteredNotifications =
        tab === 'unread'
            ? notifications.filter((item) => !item.read_at)
            : notifications;

    return (
        <div ref={containerRef} className="relative">
            {/* Popover Trigger Bell Button */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-150 ${
                    open
                        ? 'border-violet-500/40 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(167,139,250,0.2)] ring-1 ring-violet-500/30'
                        : 'border-white/[0.08] bg-[#0c0d12] text-zinc-400 shadow-sm hover:border-white/20 hover:bg-[#121318] hover:text-white'
                }`}
                title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                aria-expanded={open}
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold font-mono text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu Overlay */}
            {open && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[380px] sm:w-[420px] rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] backdrop-blur-2xl ring-1 ring-white/[0.04] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                    {/* Specular top highlight */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {/* Top Header Bar */}
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 bg-[#0c0d12]/70">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[10px] font-bold font-mono text-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.2)]">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                                title="Mark all as read"
                            >
                                <CheckCheck className="h-3.5 w-3.5 text-violet-400" />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>

                    {/* Segmented Triage Filter Pills */}
                    <div className="flex items-center justify-between border-b border-white/[0.04] bg-[#0c0d12]/40 px-4 py-2">
                        <div className="inline-flex rounded-lg border border-white/[0.06] bg-[#07090e] p-0.5">
                            <button
                                type="button"
                                onClick={() => setTab('unread')}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                    tab === 'unread'
                                        ? 'bg-violet-500/20 text-white shadow-sm ring-1 ring-violet-500/30'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                <span>Unread</span>
                                {unreadCount > 0 && (
                                    <span
                                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                                            tab === 'unread'
                                                ? 'bg-violet-400 text-black'
                                                : 'bg-white/10 text-zinc-300'
                                        }`}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab('all')}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                    tab === 'all'
                                        ? 'bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                <span>All</span>
                                <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[9px] font-mono font-bold text-zinc-400">
                                    {notifications.length}
                                </span>
                            </button>
                        </div>

                        <span className="text-[10px] text-zinc-500 font-mono">
                            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'item' : 'items'}
                        </span>
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[380px] overflow-y-auto custom-scroll divide-y divide-white/[0.04]">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((item) => {
                                const isUnread = !item.read_at;
                                const badge = getNotificationBadge(item);
                                const Icon = badge.icon;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className={`group relative flex items-start gap-3 p-3.5 cursor-pointer transition-all ${
                                            isUnread
                                                ? 'bg-violet-500/[0.04] hover:bg-violet-500/[0.08] border-l-2 border-l-violet-500'
                                                : 'opacity-75 hover:opacity-100 hover:bg-white/[0.03] border-l-2 border-l-transparent'
                                        }`}
                                    >
                                        {/* Event Pill Icon Badge */}
                                        <div
                                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${badge.pillClass}`}
                                            title={badge.label}
                                        >
                                            <Icon className="h-3.5 w-3.5" />
                                        </div>

                                        {/* Notification Text & Meta */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    {item.request_id && (
                                                        <span className="font-mono text-[10px] font-bold text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.2 rounded">
                                                            #REQ-{item.request_id}
                                                        </span>
                                                    )}
                                                    <p className="truncate text-xs font-semibold text-zinc-200 group-hover:text-white">
                                                        {item.request_title ?? 'Work Request Update'}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 text-[10px] text-zinc-500 font-mono">
                                                    {formatRelativeTime(item.created_at)}
                                                </span>
                                            </div>

                                            {item.message && (
                                                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                                                    {item.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* 1-Click Toggle Read/Unread Action Button on Hover */}
                                        <div className="flex shrink-0 items-center self-center pl-1">
                                            <button
                                                type="button"
                                                onClick={(e) => handleToggleRead(item.id, e)}
                                                className={`flex h-6 w-6 items-center justify-center rounded-lg transition-colors ${
                                                    isUnread
                                                        ? 'text-violet-400 hover:bg-violet-500/20 hover:text-white'
                                                        : 'text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-200'
                                                }`}
                                                title={isUnread ? 'Mark as read' : 'Mark as unread'}
                                                aria-label={isUnread ? 'Mark as read' : 'Mark as unread'}
                                            >
                                                {isUnread ? (
                                                    <>
                                                        <span className="group-hover:hidden h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
                                                        <Check className="hidden group-hover:block h-3.5 w-3.5 text-emerald-400" />
                                                    </>
                                                ) : (
                                                    <Mail className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0c0d12] text-zinc-400 mb-3 shadow-inner">
                                    {tab === 'unread' ? (
                                        <Check className="h-6 w-6 text-emerald-400" />
                                    ) : (
                                        <Inbox className="h-6 w-6 text-zinc-500" />
                                    )}
                                </div>
                                <p className="text-xs font-bold text-zinc-200">
                                    {tab === 'unread' ? 'All caught up' : 'No notifications'}
                                </p>
                                <p className="mt-1 text-[11px] text-zinc-500 max-w-[240px]">
                                    {tab === 'unread'
                                        ? 'No unread notifications in your inbox.'
                                        : 'Workspace notifications will appear here.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-white/[0.06] bg-[#0c0d12]/70 px-4 py-2.5">
                        <Link
                            href={route('notifications.index')}
                            onClick={() => setOpen(false)}
                            className="group flex items-center justify-between text-xs font-semibold text-zinc-400 transition-colors hover:text-violet-300"
                        >
                            <span>View all in Inbox</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
