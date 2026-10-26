import Sidebar from '@/Components/Sidebar';
import CommandPalette from '@/Components/CommandPalette';
import { QuickCreateModal } from '@/Features/Requests';
import { NotificationPopover } from '@/Features/Notifications';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, Menu } from 'lucide-react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

import ShortcutsModal from '@/Components/ShortcutsModal';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const props = usePage().props as any;
    const authUser = props.auth?.user;
    const projects = props.workspaceProjects ?? props.projects ?? [];
    const users = props.users ?? [];

    const [commandOpen, setCommandOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [wsConnected, setWsConnected] = useState<boolean>(() => {
        const echo = (window as unknown as { Echo?: any }).Echo;
        return Boolean(echo);
    });

    useEffect(() => {
        const echo = (window as unknown as { Echo?: any }).Echo;
        if (!echo) return;

        try {
            const connector = echo.connector;
            const pusher = connector?.pusher || connector?.options?.client;
            if (pusher?.connection) {
                pusher.connection.bind('connected', () => setWsConnected(true));
                pusher.connection.bind('disconnected', () => setWsConnected(false));
                pusher.connection.bind('unavailable', () => setWsConnected(false));
                pusher.connection.bind('failed', () => setWsConnected(false));
                if (pusher.connection.state === 'connected') {
                    setWsConnected(true);
                }
            }
        } catch {
            // Graceful fallback
        }
    }, []);

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const timer = setInterval(updateTime, 10000);
        return () => clearInterval(timer);
    }, []);

    // Real-time private notification channel for authenticated user
    useEffect(() => {
        const echo = (window as unknown as { Echo?: any }).Echo;
        if (!echo || !authUser?.id) return;

        try {
            const channelName = `App.Models.User.${authUser.id}`;
            const channel = echo.private(channelName);
            const handledIds = new Set<string>();

            const handleNotification = (notification: any) => {
                const notifId = String(
                    notification?.id ||
                    notification?.data?.id ||
                    `${Date.now()}-${Math.random()}`
                );
                if (handledIds.has(notifId)) return;
                handledIds.add(notifId);
                setTimeout(() => handledIds.delete(notifId), 5000);

                const message =
                    notification?.message ||
                    notification?.data?.message ||
                    'New notification';
                const targetUrl =
                    notification?.url ||
                    notification?.data?.url;

                toast.info(message, {
                    action: targetUrl
                        ? {
                              label: 'View',
                              onClick: () => router.visit(targetUrl),
                          }
                        : undefined,
                });

                const eventDetail = { detail: notification };
                window.dispatchEvent(new CustomEvent('notification-received', eventDetail));
                window.dispatchEvent(new CustomEvent('relay:notification-received', eventDetail));
            };

            channel.notification(handleNotification);
            channel.listen(
                '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
                handleNotification
            );

            return () => {
                echo.leave(channelName);
            };
        } catch {
            // Graceful fallback
        }
    }, [authUser?.id]);

    // Global keyboard shortcuts: 'C' (Create), '?' (Help), and 'G' navigation sequence
    useEffect(() => {
        let lastGTime = 0;

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isEditing =
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName) ||
                target?.isContentEditable;

            if (isEditing) return;

            // '?' opens shortcuts modal
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                setShortcutsOpen(true);
                return;
            }

            // 'C' opens quick create modal
            if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                setCreateOpen(true);
                return;
            }

            // Two-key navigation sequences: G then [D, B, P, N, S]
            const now = Date.now();
            if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey) {
                lastGTime = now;
                return;
            }

            if (lastGTime && now - lastGTime < 1000) {
                const key = e.key.toLowerCase();
                lastGTime = 0;
                if (key === 'd') {
                    e.preventDefault();
                    router.visit(route('dashboard'));
                } else if (key === 'b') {
                    e.preventDefault();
                    router.visit(route('requests.index'));
                } else if (key === 'p') {
                    e.preventDefault();
                    router.visit(route('requests.index'));
                } else if (key === 'n') {
                    e.preventDefault();
                    router.visit(route('notifications.index'));
                } else if (key === 's') {
                    e.preventDefault();
                    router.visit(route('settings.index'));
                }
            }
        };

        const handleCustomOpen = () => setCreateOpen(true);
        const handleCustomShortcuts = () => setShortcutsOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-quick-create', handleCustomOpen);
        window.addEventListener('open-shortcuts', handleCustomShortcuts);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-quick-create', handleCustomOpen);
            window.removeEventListener('open-shortcuts', handleCustomShortcuts);
        };
    }, []);

    return (
        <div className="relay-shell relative flex min-h-screen font-sans text-zinc-100 antialiased selection:bg-zinc-700/60 selection:text-white">
            <div className="relay-grid pointer-events-none fixed inset-0 z-0 opacity-40" />
            <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
            <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                {/* Modern Precision Navbar */}
                <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-4 border-b border-zinc-800/80 bg-[#090a0f]/90 px-4 sm:px-7 backdrop-blur-xl">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(true)}
                            className="flex lg:hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-[#121318] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                            title="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="min-w-0 flex-1">{header}</div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Live Studio Status Pill */}
                        <div
                            className="hidden xl:flex h-10 items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#121318] px-3.5 text-xs text-zinc-400 font-mono shadow-sm transition-colors"
                            title={wsConnected ? 'WebSockets connected: Live real-time collaboration enabled' : 'Connecting to real-time server...'}
                        >
                            <span className="relative flex h-2 w-2">
                                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                <span className={`relative inline-flex h-2 w-2 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            </span>
                            <span className="text-zinc-300">
                                {wsConnected ? (currentTime ? `Live · ${currentTime}` : 'Live Sync') : 'Connecting…'}
                            </span>
                        </div>

                        {/* Precision Search Pill */}
                        <button
                            type="button"
                            onClick={() => setCommandOpen(true)}
                            className="hidden sm:flex h-10 items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#121318] px-3.5 text-sm text-zinc-400 shadow-sm transition-colors hover:border-zinc-700 hover:text-zinc-200 w-52 sm:w-64 md:w-72"
                        >
                            <div className="flex items-center gap-2.5">
                                <Search className="h-4 w-4 text-zinc-400" />
                                <span className="truncate text-xs sm:text-[13px]">Search or jump…</span>
                            </div>
                            <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                                ⌘K
                            </kbd>
                        </button>

                        {/* Quick Create Action Button */}
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-zinc-950 shadow-sm transition-all hover:bg-zinc-200 active:scale-[0.98]"
                            title="New Request (Press C)"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden md:inline">New Request</span>
                            <kbd className="hidden lg:inline rounded-md bg-zinc-200 px-1.5 py-0.5 text-[10px] font-mono text-zinc-800">C</kbd>
                        </button>

                        {/* Interactive Real-Time Notifications Center */}
                        <NotificationPopover />
                    </div>
                </header>
                <main className="w-full flex-1 p-6 sm:p-8">{children}</main>
            </div>

            {/* Global Linear-Style Command Palette */}
            <CommandPalette
                open={commandOpen}
                setOpen={setCommandOpen}
                onOpenCreate={() => setCreateOpen(true)}
                onOpenShortcuts={() => setShortcutsOpen(true)}
                projects={projects}
            />

            {/* Global Keyboard Shortcuts Cheat-sheet Modal */}
            <ShortcutsModal
                open={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
            />

            {/* Global Quick Create Modal */}
            <QuickCreateModal
                show={createOpen}
                onClose={() => setCreateOpen(false)}
                projects={projects}
                users={users}
                onFinished={() => router.reload()}
            />

            {/* Global Toaster for Linear Notifications */}
            <Toaster
                theme="dark"
                position="bottom-right"
                closeButton
                toastOptions={{
                    className: 'rounded-xl border border-white/[0.08] bg-[#090a0f]/95 text-zinc-100 shadow-2xl backdrop-blur-xl text-xs font-medium ring-1 ring-white/[0.04]',
                }}
            />
        </div>
    );
}
