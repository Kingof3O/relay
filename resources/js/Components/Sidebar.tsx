import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from './ApplicationLogo';
import Dropdown from './Dropdown';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import {
    LayoutDashboard,
    KanbanSquare,
    Settings,
    ChevronDown,
    User as UserIcon,
    Bell,
    LogOut,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Shield,
    Repeat,
    CalendarRange,
    Bookmark,
    Radio,
    X,
    Plus,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { PageProps, WorkspaceProject, WorkspaceNotification } from '@/types';

interface SidebarProps {
    mobileOpen?: boolean;
    onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps = {}) {
    const pageProps = usePage<PageProps<{ workspaceProjects?: WorkspaceProject[] }>>().props;
    const user = pageProps.auth?.user ?? { name: 'User' };
    const roleName = pageProps.auth?.role?.name ?? 'Member';
    const notifications: WorkspaceNotification[] = pageProps.workspaceNotifications ?? [];
    const projects: WorkspaceProject[] = pageProps.workspaceProjects ?? [];
    const savedViews: Array<{ id: number; name: string; icon: string; filters: Record<string, unknown>; is_pinned: boolean }> =
        (pageProps as any).savedViews ?? [];

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isMyWorkActive = route().current('requests.index') && searchParams?.get('my_work') === '1';
    const isBoardActive = route().current('requests.*') && !isMyWorkActive && !searchParams?.get('project');
    const activeProjectId = searchParams?.get('project');

    // Sidebar collapse state with localStorage persistence
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        const stored = localStorage.getItem('relay_sidebar_collapsed');
        if (stored !== null) {
            setCollapsed(stored === 'true');
        }
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem('relay_sidebar_collapsed', String(next));
            return next;
        });
    };

    const mainLinks = [
        {
            name: 'Dashboard',
            href: route('dashboard'),
            active: route().current('dashboard'),
            icon: LayoutDashboard,
            shortcut: '⌘D',
        },
        {
            name: 'My Tasks',
            href: route('requests.index', { my_work: '1' }),
            active: isMyWorkActive,
            icon: Sparkles,
            shortcut: '⌘M',
        },
        {
            name: 'Studio Board',
            href: route('requests.index'),
            active: isBoardActive,
            icon: KanbanSquare,
            shortcut: '⌘B',
        },
        {
            name: 'Cycles',
            href: route('cycles.index'),
            active: route().current('cycles.*'),
            icon: Repeat,
            shortcut: '⌘C',
        },
        {
            name: 'Roadmap',
            href: route('roadmap.index'),
            active: route().current('roadmap.*'),
            icon: CalendarRange,
            shortcut: '⌘R',
        },
    ];

    const initialUnread =
        pageProps.unreadNotificationsCount ??
        notifications.filter((n: WorkspaceNotification) => !n.read_at).length;
    const [unreadCount, setUnreadCount] = useState<number>(initialUnread);

    useEffect(() => {
        setUnreadCount(
            pageProps.unreadNotificationsCount ??
                notifications.filter((n: WorkspaceNotification) => !n.read_at).length
        );
    }, [pageProps.unreadNotificationsCount, pageProps.workspaceNotifications]);

    useEffect(() => {
        const handleNotification = () => {
            setUnreadCount((prev) => prev + 1);
        };

        window.addEventListener('notification-received', handleNotification);
        window.addEventListener('relay:notification-received', handleNotification);

        return () => {
            window.removeEventListener('notification-received', handleNotification);
            window.removeEventListener('relay:notification-received', handleNotification);
        };
    }, []);

    const workspaceLinks = [
        {
            name: 'Inbox',
            href: route('notifications.index'),
            active: route().current('notifications.*'),
            icon: Bell,
            badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null,
        },
        {
            name: 'Integrations',
            href: route('integrations.index'),
            active: route().current('integrations.*'),
            icon: Radio,
            badge: null,
        },
        {
            name: 'Settings',
            href: route('settings.index'),
            active: route().current('settings.*'),
            icon: Settings,
            badge: null,
        },
    ];

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onCloseMobile}
                />
            )}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col justify-between border-r border-zinc-800/80 bg-[#0c0d12] transition-transform duration-200 ease-in-out select-none lg:sticky lg:top-0 lg:h-screen lg:self-start lg:z-30 lg:translate-x-0 ${
                    mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                } ${
                    collapsed ? 'lg:w-[76px] lg:p-3 w-[280px] p-4' : 'w-[280px] p-4'
                }`}
            >
                {/* Top Fixed Header: Brand Logo & Workspace Card */}
                <div className="shrink-0 space-y-3 pb-3">
                    {/* Brand Logo Header */}
                    <div
                        className={`flex items-center border-b border-zinc-800/80 pb-3 ${
                            collapsed ? 'justify-center px-0 flex-col gap-2' : 'justify-between px-1'
                        }`}
                    >
                        <Link
                            href={route('dashboard')}
                            prefetch="hover"
                            cacheFor="30s"
                            className="group flex items-center gap-2.5 rounded-xl p-1 transition-colors hover:bg-zinc-850/60"
                            title="Relay Studio"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-750 bg-[#121318] text-white shadow-sm transition-all group-hover:border-zinc-650 group-hover:bg-[#181920]">
                                <ApplicationLogo className="h-5 w-5 text-white" />
                            </div>
                            {(!collapsed || mobileOpen) && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[15px] font-bold tracking-tight text-white">Relay</span>
                                    <span className="rounded-md border border-zinc-800 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400">
                                        Studio
                                    </span>
                                </div>
                            )}
                        </Link>

                        <div className="flex items-center gap-1">
                            {!collapsed && (
                                <button
                                    type="button"
                                    onClick={toggleCollapsed}
                                    className="hidden lg:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                                    title="Collapse sidebar (⌘[)"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                            )}
                            {onCloseMobile && (
                                <button
                                    type="button"
                                    onClick={onCloseMobile}
                                    className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    title="Close navigation"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                {collapsed && (
                    <div className="flex justify-center pt-1 pb-1">
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                            title="Expand sidebar (⌘[)"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Workspace Switcher Card */}
                <div>
                    <WorkspaceSwitcher collapsed={collapsed} />
                </div>
            </div>

            {/* Middle Scrollable Navigation List */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden no-scrollbar py-1">
                {/* Primary Navigation Group */}
                <div className="space-y-1">
                    {!collapsed && (
                        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Workspace
                        </p>
                    )}
                    {mainLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                prefetch="hover"
                                cacheFor="30s"
                                title={collapsed ? link.name : undefined}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                    link.active
                                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-750'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60 border border-transparent'
                                } ${collapsed ? 'justify-center px-0 h-11 w-full' : ''}`}
                            >
                                <Icon
                                    className={`h-5 w-5 shrink-0 transition-colors ${
                                        link.active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                                    }`}
                                />
                                {!collapsed && (
                                    <div className="flex flex-1 items-center justify-between">
                                        <span className="truncate">{link.name}</span>
                                        {link.shortcut && (
                                            <kbd className="text-[11px] font-mono text-zinc-500 opacity-0 transition-opacity group-hover:opacity-100">
                                                {link.shortcut}
                                            </kbd>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
 
                {/* Custom Saved Views Section */}
                {savedViews.length > 0 && (
                    <div className="mt-5 space-y-1">
                        {!collapsed && (
                            <div className="flex items-center justify-between px-3 pb-1.5">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                    Views
                                </p>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                    {savedViews.length}
                                </span>
                            </div>
                        )}
                        {savedViews.map((view) => {
                            const queryParams: Record<string, any> = {};
                            if (view.filters) {
                                Object.entries(view.filters).forEach(([k, v]) => {
                                    if (v !== '' && v !== null && v !== undefined) {
                                        queryParams[k] = v;
                                    }
                                });
                            }
                            const href = route('requests.index', queryParams);
                            return (
                                <Link
                                    key={view.id}
                                    href={href}
                                    title={collapsed ? view.name : undefined}
                                    className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50 border border-transparent ${
                                        collapsed ? 'justify-center px-0 h-10 w-full' : ''
                                    }`}
                                >
                                    <Bookmark className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                    {!collapsed && (
                                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                                            <span className="truncate">{view.name}</span>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Projects Section */}
                <div className="mt-6 space-y-1">
                    {!collapsed && (
                        <div className="flex items-center justify-between px-3 pb-1.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                Projects
                            </p>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('requests.index')}
                                    prefetch="hover"
                                    cacheFor="30s"
                                    className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                                >
                                    All
                                </Link>
                                <Link
                                    href={route('settings.index')}
                                    title="Add or manage projects"
                                    className="flex h-4 w-4 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                >
                                    <Plus className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    )}
                    {projects.slice(0, 6).map((project: WorkspaceProject) => {
                        const isProjectActive = String(project.id) === activeProjectId;
                        return (
                            <Link
                                key={project.id}
                                href={route('requests.index', { project: project.id })}
                                prefetch="hover"
                                cacheFor="30s"
                                title={collapsed ? project.name : undefined}
                                className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all ${
                                    isProjectActive
                                        ? 'bg-zinc-800 text-white border border-zinc-750'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50 border border-transparent'
                                } ${collapsed ? 'justify-center px-0 h-10 w-full' : ''}`}
                            >
                                <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: project.color ?? '#71717a' }}
                                />
                                {!collapsed && (
                                    <div className="flex flex-1 items-center justify-between overflow-hidden">
                                        <span className="truncate">{project.name}</span>
                                        {(project.active_count ?? 0) > 0 && (
                                            <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-1.5 text-[10px] font-mono text-zinc-400">
                                                {project.active_count}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* System / Administration Section */}
                <div className="mt-6 space-y-1">
                    {!collapsed && (
                        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Settings
                        </p>
                    )}
                    {workspaceLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                prefetch="hover"
                                cacheFor="30s"
                                title={collapsed ? link.name : undefined}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                                    link.active
                                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-750'
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/60 border border-transparent'
                                } ${collapsed ? 'justify-center px-0 h-11 w-full' : ''}`}
                            >
                                <Icon
                                    className={`h-5 w-5 shrink-0 transition-colors ${
                                        link.active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                                    }`}
                                />
                                {!collapsed && (
                                    <div className="flex flex-1 items-center justify-between">
                                        <span className="truncate">{link.name}</span>
                                        {link.badge && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-800 border border-zinc-750 px-1.5 text-[10px] font-mono font-medium text-zinc-300">
                                                {link.badge}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* User Account Footer with Dropdown */}
            <div className="shrink-0 border-t border-zinc-800/80 pt-3">
                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            className={`group flex w-full items-center rounded-xl border border-transparent p-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-800 hover:bg-zinc-850/60 hover:text-white ${
                                collapsed ? 'justify-center' : 'justify-between'
                            }`}
                            title={collapsed ? user.name : undefined}
                        >
                            <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-800 text-xs font-semibold text-zinc-200">
                                    {user.name.charAt(0)}
                                </div>
                                {!collapsed && (
                                    <div className="min-w-0 text-left">
                                        <p className="truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs text-zinc-400">
                                            {roleName}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {!collapsed && (
                                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500 transition-transform group-hover:text-zinc-300" />
                            )}
                        </button>
                    </Dropdown.Trigger>
                    <Dropdown.Content
                        align="left"
                        position="up"
                        contentClasses="w-[250px] p-1.5 rounded-xl border border-zinc-800 bg-[#121318] shadow-2xl text-xs"
                    >
                        <div className="px-3 py-2.5 border-b border-zinc-800 mb-1">
                            <p className="font-semibold text-zinc-100 text-sm">{user.name}</p>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">{user.email || `@${user.username}`}</p>
                            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300 border border-zinc-700">
                                <Shield className="h-3 w-3" />
                                {roleName}
                            </span>
                        </div>
                        <Dropdown.Link href={route('profile.edit')} prefetch="hover" cacheFor="30s" className="py-2 px-2.5 text-xs">
                            <UserIcon className="h-4 w-4 text-zinc-400" />
                            <span>Profile & Account</span>
                        </Dropdown.Link>
                        <Dropdown.Link href={route('notifications.index')} prefetch="hover" cacheFor="30s" className="py-2 px-2.5 text-xs">
                            <Bell className="h-4 w-4 text-zinc-400" />
                            <span>Notifications</span>
                        </Dropdown.Link>
                        <Dropdown.Link href={route('settings.index')} prefetch="hover" cacheFor="30s" className="py-2 px-2.5 text-xs">
                            <Settings className="h-4 w-4 text-zinc-400" />
                            <span>Workspace Settings</span>
                        </Dropdown.Link>
                        <div className="my-1 border-t border-zinc-800" />
                        <Dropdown.Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="py-2 px-2.5 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300"
                        >
                            <LogOut className="h-4 w-4 text-rose-400" />
                            <span>Sign out</span>
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </aside>
        </>
    );
}
