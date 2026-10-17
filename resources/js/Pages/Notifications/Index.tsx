import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import {
    Activity,
    Inbox,
    UserCheck,
    Clock,
    CheckCircle2,
    CheckCheck,
    Check,
    Search,
    X,
    Filter,
    ArrowRight,
    ArrowUpRight,
    Mail,
    Radio,
    Sparkles,
} from 'lucide-react';
import {
    NotificationItem,
    formatRelativeTime,
    getNotificationBadge,
} from '@/Features/Notifications/types';
import { notifySuccess } from '@/lib/toast';

type TriageTab = 'all' | 'inbox' | 'assignments' | 'reviews' | 'resolved';

export default function Index({
    notifications: initialNotifications = [],
}: PageProps<{ notifications: NotificationItem[] }>) {
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
    const [currentTab, setCurrentTab] = useState<TriageTab>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Derived counts
    const totalCount = notifications.length;

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.read_at).length,
        [notifications]
    );

    const readCount = useMemo(
        () => notifications.filter((n) => Boolean(n.read_at)).length,
        [notifications]
    );

    const assignmentsCount = useMemo(
        () =>
            notifications.filter((n) => {
                const ev = (n.event ?? '').toLowerCase();
                const msg = (n.message ?? '').toLowerCase();
                return (
                    ev === 'assignment' ||
                    msg.includes('assigned') ||
                    msg.includes('assignment') ||
                    msg.includes('owner')
                );
            }).length,
        [notifications]
    );

    const reviewCount = useMemo(
        () =>
            notifications.filter((n) => {
                const ev = (n.event ?? '').toLowerCase();
                const msg = (n.message ?? '').toLowerCase();
                return (
                    ev === 'review' ||
                    msg.includes('review') ||
                    msg.includes('sign-off') ||
                    msg.includes('approval') ||
                    (ev === 'status_changed' && msg.includes('review'))
                );
            }).length,
        [notifications]
    );

    const clearanceRate = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 100;

    // Filter notifications based on tab and search
    const filteredNotifications = useMemo(() => {
        return notifications.filter((item) => {
            // Tab filter
            if (currentTab === 'inbox' && item.read_at) {
                return false;
            }
            if (currentTab === 'resolved' && !item.read_at) {
                return false;
            }
            if (currentTab === 'assignments') {
                const ev = (item.event ?? '').toLowerCase();
                const msg = (item.message ?? '').toLowerCase();
                const isAssignment =
                    ev === 'assignment' ||
                    msg.includes('assigned') ||
                    msg.includes('assignment') ||
                    msg.includes('owner');
                if (!isAssignment) return false;
            }
            if (currentTab === 'reviews') {
                const ev = (item.event ?? '').toLowerCase();
                const msg = (item.message ?? '').toLowerCase();
                const isReview =
                    ev === 'review' ||
                    msg.includes('review') ||
                    msg.includes('sign-off') ||
                    msg.includes('approval') ||
                    (ev === 'status_changed' && msg.includes('review'));
                if (!isReview) return false;
            }

            // Search filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchMsg = item.message?.toLowerCase().includes(q);
                const matchTitle = item.request_title?.toLowerCase().includes(q);
                const matchId =
                    item.request_id?.toString().includes(q) ||
                    `#req-${item.request_id}`.toLowerCase().includes(q) ||
                    `req-${item.request_id}`.toLowerCase().includes(q);
                const matchEvent = item.event?.toLowerCase().includes(q);
                const matchActor =
                    item.actor_name?.toLowerCase().includes(q) ||
                    item.actor?.name?.toLowerCase().includes(q);
                if (!matchMsg && !matchTitle && !matchId && !matchEvent && !matchActor) {
                    return false;
                }
            }

            return true;
        });
    }, [notifications, currentTab, searchQuery]);

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        setNotifications((prev) =>
            prev.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))
        );

        try {
            await axios.post(route('notifications.read-all'));
            notifySuccess('Inbox cleared', 'All notifications have been marked as read.');
        } catch {
            // Silently fall back
        }
    };

    // Toggle 1-click read/unread status
    const toggleReadStatus = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const item = notifications.find((n) => n.id === id);
        if (!item) return;

        const isCurrentlyRead = Boolean(item.read_at);
        const newReadAt = isCurrentlyRead ? null : new Date().toISOString();

        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read_at: newReadAt } : n))
        );

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

    // Navigate to ticket
    const handleNavigate = (item: NotificationItem) => {
        if (!item.read_at) {
            toggleReadStatus(item.id);
        }
        const targetUrl =
            item.url ??
            (item.request_id ? route('requests.show', item.request_id) : route('requests.index'));
        router.visit(targetUrl);
    };

    // KPI Tiles definition
    const kpiMetrics = [
        {
            tab: 'all' as TriageTab,
            label: 'Total Activity',
            value: totalCount,
            icon: Activity,
            detail: 'All recorded alerts',
            badge: (
                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
                    Stream <ArrowRight className="h-3 w-3" />
                </span>
            ),
        },
        {
            tab: 'inbox' as TriageTab,
            label: 'Unread Items',
            value: unreadCount,
            icon: Inbox,
            detail: unreadCount > 0 ? 'Requires attention' : 'Inbox zero',
            badge:
                unreadCount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                        Action needed
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                        <Check className="h-3 w-3" /> Caught up
                    </span>
                ),
        },
        {
            tab: 'assignments' as TriageTab,
            label: 'Work Assignments',
            value: assignmentsCount,
            icon: UserCheck,
            detail: 'Direct tasks & owners',
            badge: (
                <span className="rounded border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-medium text-purple-400">
                    Assignments
                </span>
            ),
        },
        {
            tab: 'reviews' as TriageTab,
            label: 'Review Requests',
            value: reviewCount,
            icon: Clock,
            detail: 'Sign-offs & approvals',
            badge: (
                <span className="rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                    Sign-offs
                </span>
            ),
        },
        {
            tab: 'resolved' as TriageTab,
            label: 'Resolved / Read',
            value: readCount,
            icon: CheckCircle2,
            detail: `${clearanceRate}% clearance rate`,
            badge: (
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    Archived
                </span>
            ),
        },
    ];

    const sidebarTabs = [
        {
            id: 'all' as TriageTab,
            label: 'All Activity',
            icon: Activity,
            count: totalCount,
            badgeClass: 'bg-white/10 text-zinc-300',
        },
        {
            id: 'inbox' as TriageTab,
            label: 'Inbox (Unread)',
            icon: Inbox,
            count: unreadCount,
            badgeClass:
                unreadCount > 0
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_10px_rgba(167,139,250,0.3)]'
                    : 'bg-white/10 text-zinc-400',
        },
        {
            id: 'assignments' as TriageTab,
            label: 'Assignments',
            icon: UserCheck,
            count: assignmentsCount,
            badgeClass: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
        },
        {
            id: 'reviews' as TriageTab,
            label: 'Review Alerts',
            icon: Clock,
            count: reviewCount,
            badgeClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
        },
        {
            id: 'resolved' as TriageTab,
            label: 'Resolved / Read',
            icon: CheckCircle2,
            count: readCount,
            badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400">
                                Activity
                            </span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[11px] text-zinc-500">Inbox Triage</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2.5">
                            <h1 className="text-xl font-bold tracking-tight text-white">Notifications</h1>
                            {unreadCount > 0 ? (
                                <span className="inline-flex items-center rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-xs font-bold font-mono text-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.25)]">
                                    {unreadCount} unread
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                                    <Check className="h-3 w-3" />
                                    <span>All caught up</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick action: Mark all as read */}
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-200 shadow-sm transition-all hover:bg-white/[0.08] hover:text-white hover:border-white/20 active:scale-95"
                        >
                            <CheckCheck className="h-4 w-4 text-violet-400" />
                            <span>Mark all as read</span>
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Notifications · Linear Inbox" />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* 1. Top KPI Metric Row (Dashboard High-Density Obsidian Style) */}
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {kpiMetrics.map((metric) => {
                        const Icon = metric.icon;
                        const isActive = currentTab === metric.tab;

                        return (
                            <button
                                key={metric.label}
                                type="button"
                                onClick={() => setCurrentTab(metric.tab)}
                                className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
                                    isActive
                                        ? 'border-violet-500/50 bg-[#161720] shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-1 ring-violet-500/30'
                                        : 'border-white/[0.07] bg-[#111216] hover:border-zinc-700 hover:bg-[#14161c]'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3 w-full">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                                            isActive
                                                ? 'border-violet-500/40 bg-violet-500/20 text-violet-300'
                                                : 'border-zinc-800 bg-zinc-850 text-zinc-300'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>{metric.badge}</div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-medium text-zinc-400">{metric.label}</p>
                                    <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                                        {metric.value}
                                    </p>
                                    <p className="mt-1 text-[11px] text-zinc-500">{metric.detail}</p>
                                </div>
                            </button>
                        );
                    })}
                </section>

                {/* 2. Expansive 12-Column Triage Layout */}
                <div className="grid gap-6 lg:grid-cols-12 items-start">
                    {/* Left Column (3 cols on lg): Filter Sidebar & Navigation */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Navigation Card */}
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-3 shadow-lg shadow-black/40 ring-1 ring-white/[0.04]">
                            <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                    <Filter className="h-3.5 w-3.5 text-zinc-400" />
                                    <span>Triage Filter</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    {filteredNotifications.length} items
                                </span>
                            </div>

                            <nav className="mt-1 space-y-1">
                                {sidebarTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = currentTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setCurrentTab(tab.id)}
                                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                                                isActive
                                                    ? 'bg-violet-500/15 text-white border border-violet-500/30 shadow-sm'
                                                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon
                                                    className={`h-4 w-4 ${
                                                        isActive ? 'text-violet-400' : 'text-zinc-500'
                                                    }`}
                                                />
                                                <span>{tab.label}</span>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                                                    isActive
                                                        ? 'bg-violet-400 text-black font-bold'
                                                        : tab.badgeClass
                                                }`}
                                            >
                                                {tab.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-4 shadow-lg shadow-black/40 ring-1 ring-white/[0.04] space-y-3">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <span>Quick Actions</span>
                                <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                            </div>

                            <button
                                type="button"
                                onClick={markAllAsRead}
                                disabled={unreadCount === 0}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition-all ${
                                    unreadCount > 0
                                        ? 'border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-white hover:border-violet-500/50 active:scale-[0.98]'
                                        : 'border border-white/[0.05] bg-white/[0.02] text-zinc-600 cursor-not-allowed'
                                }`}
                            >
                                <CheckCheck className="h-4 w-4" />
                                <span>Mark all as read</span>
                            </button>

                            <Link
                                href={route('requests.index')}
                                className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                            >
                                <span>Kanban Board</span>
                                <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
                            </Link>

                            <Link
                                href={route('requests.index', { my_work: '1' })}
                                className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                            >
                                <span>My Work Queue</span>
                                <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
                            </Link>
                        </div>

                        {/* Telemetry Summary Card */}
                        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-4 shadow-lg shadow-black/40 ring-1 ring-white/[0.04] space-y-3.5">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <span>Telemetry Summary</span>
                                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                            </div>

                            {/* Clearance Rate Progress Bar */}
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-zinc-400 font-medium">Clearance Rate</span>
                                    <span className="font-mono font-bold text-zinc-200">
                                        {clearanceRate}%
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-300"
                                        style={{ width: `${clearanceRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* Telemetry Key-Value Stats */}
                            <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                                <div className="flex items-center justify-between text-zinc-400">
                                    <span>Sync Status</span>
                                    <span className="flex items-center gap-1.5 font-medium text-emerald-400 font-mono text-[11px]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Live Stream
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-zinc-400">
                                    <span>Scope</span>
                                    <span className="text-zinc-200 font-medium text-[11px]">
                                        All Workspaces
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-zinc-400">
                                    <span>Pending Triage</span>
                                    <span className="font-mono text-zinc-200 font-semibold text-[11px]">
                                        {unreadCount} items
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (9 cols on lg): Search Bar & Full-Width Triage Rows */}
                    <div className="lg:col-span-9 space-y-4">
                        {/* Main Obsidian Card Container */}
                        <div className="relative rounded-2xl border border-white/[0.08] bg-[#090a0f]/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl ring-1 ring-white/[0.04] overflow-hidden">
                            {/* Specular top highlight */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            {/* Search Bar & Stream Header Controls */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] bg-[#0c0d12]/70 p-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="text-xs font-semibold text-zinc-200">
                                        {sidebarTabs.find((t) => t.id === currentTab)?.label}
                                    </span>
                                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-400">
                                        {filteredNotifications.length}
                                    </span>
                                </div>

                                {/* Search Input Filter */}
                                <div className="relative w-full sm:w-80">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                                        <Search className="h-3.5 w-3.5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Filter title, #REQ-ID, actor, message..."
                                        className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-8 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 shadow-inner transition-colors focus:border-violet-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 hover:text-white"
                                            title="Clear search"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notification List Section */}
                            {filteredNotifications.length > 0 ? (
                                <div className="divide-y divide-white/[0.04]">
                                    {filteredNotifications.map((notification) => {
                                        const isUnread = !notification.read_at;
                                        const badge = getNotificationBadge(notification);
                                        const Icon = badge.icon;

                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNavigate(notification)}
                                                className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-3.5 px-5 py-4 cursor-pointer transition-all duration-150 ${
                                                    isUnread
                                                        ? 'bg-violet-500/[0.04] hover:bg-violet-500/[0.08] border-l-2 border-l-violet-500'
                                                        : 'opacity-85 hover:opacity-100 hover:bg-white/[0.02] border-l-2 border-l-transparent'
                                                }`}
                                            >
                                                {/* Left Side: Unread Dot, Event Pill Badge, Ticket ID, Request Title & Message */}
                                                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                                                    {/* Unread indicator dot */}
                                                    <div className="mt-1 sm:mt-0 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                                                        {isUnread ? (
                                                            <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
                                                        ) : (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                                                        )}
                                                    </div>

                                                    {/* Event Pill Badge */}
                                                    <div
                                                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold shrink-0 ${badge.pillClass}`}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" />
                                                        <span>{badge.label}</span>
                                                    </div>

                                                    {/* Ticket ID #REQ-ID */}
                                                    {notification.request_id && (
                                                        <span className="shrink-0 font-mono text-[11px] font-bold text-zinc-300 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded shadow-sm">
                                                            #REQ-{notification.request_id}
                                                        </span>
                                                    )}

                                                    {/* Request Title & Message Excerpt */}
                                                    <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                        <span className="text-xs font-semibold text-zinc-100 group-hover:text-white truncate max-w-xs sm:max-w-sm shrink-0">
                                                            {notification.request_title ?? 'Work Request'}
                                                        </span>

                                                        {notification.message && (
                                                            <p className="text-xs text-zinc-400 group-hover:text-zinc-300 truncate leading-relaxed">
                                                                {notification.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right Side: Relative Timestamp, 1-Click Toggle Read/Unread, Direct Link */}
                                                <div className="flex items-center self-end md:self-center gap-3 shrink-0 pl-7 md:pl-0">
                                                    {/* Relative Timestamp */}
                                                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{formatRelativeTime(notification.created_at)}</span>
                                                    </div>

                                                    {/* 1-Click Quick Action Toggle Read/Unread Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => toggleReadStatus(notification.id, e)}
                                                        className={`flex h-7 px-2.5 items-center gap-1.5 rounded-lg border text-xs font-medium transition-all ${
                                                            isUnread
                                                                ? 'border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-white'
                                                                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200'
                                                        }`}
                                                        title={isUnread ? 'Mark as read' : 'Mark as unread'}
                                                        aria-label={isUnread ? 'Mark as read' : 'Mark as unread'}
                                                    >
                                                        {isUnread ? (
                                                            <>
                                                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                                <span className="hidden sm:inline">Mark read</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                                                                <span className="hidden sm:inline">Mark unread</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* Direct Arrow Navigation */}
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors group-hover:text-zinc-200 group-hover:bg-white/[0.04]">
                                                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Sleek Obsidian Zero-Inbox State Card */
                                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/30 bg-[#0c0d12] text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20 mb-4">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>

                                    <h3 className="text-base font-bold text-white tracking-tight">
                                        {searchQuery ? 'No matching notifications' : 'All caught up'}
                                    </h3>
                                    <p className="mt-1 max-w-sm text-xs text-zinc-400 leading-relaxed">
                                        {searchQuery
                                            ? `No notifications found matching "${searchQuery}".`
                                            : currentTab === 'assignments'
                                            ? 'No assignment updates requiring your attention right now.'
                                            : currentTab === 'reviews'
                                            ? 'No pending review alerts or sign-off requests.'
                                            : currentTab === 'inbox'
                                            ? 'No unread notifications in your triage inbox. You are completely up to date with your workspace.'
                                            : 'No activity items found in this stream.'}
                                    </p>

                                    {searchQuery ? (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            <span>Clear search filter</span>
                                        </button>
                                    ) : (
                                        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                                            <Link
                                                href={route('requests.index')}
                                                className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/20 hover:text-white shadow-sm"
                                            >
                                                <span>Go to Kanban Board</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
