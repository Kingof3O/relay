import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ShieldAlert,
    FileQuestion,
    RotateCcw,
    Search,
    ArrowLeft,
    Home,
    Terminal,
} from 'lucide-react';

interface ErrorProps {
    status?: number;
}

export default function ErrorPage({ status = 404 }: ErrorProps) {
    const errorConfigs: Record<
        number,
        {
            title: string;
            description: string;
            badge: string;
            icon: React.ComponentType<{ className?: string }>;
        }
    > = {
        404: {
            title: 'Page Not Found',
            description:
                "We couldn't find the page or task you're looking for. It may have been moved or deleted.",
            badge: '404 · Not Found',
            icon: FileQuestion,
        },
        403: {
            title: 'Access Restricted',
            description:
                "You don't have permission to access this page. Please contact your workspace admin if you need access.",
            badge: '403 · Forbidden',
            icon: ShieldAlert,
        },
        500: {
            title: 'Server Error',
            description:
                "Something went wrong on our end. We've logged this issue and are looking into it.",
            badge: '500 · Server Error',
            icon: AlertTriangle,
        },
        419: {
            title: 'Session Expired',
            description:
                'Your session has timed out due to inactivity. Please refresh the page to log back in.',
            badge: '419 · Session Expired',
            icon: RotateCcw,
        },
    };

    const config = errorConfigs[status] || {
        title: 'Something Went Wrong',
        description:
            'An unexpected error occurred. Please head back to your workspace dashboard or try again.',
        badge: `${status} · Error`,
        icon: AlertTriangle,
    };

    const Icon = config.icon;

    const handleSearchClick = () => {
        // Dispatch synthetic Cmd+K keyboard event to open CommandPalette
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            code: 'KeyK',
            metaKey: true,
            bubbles: true,
        });
        document.dispatchEvent(event);
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="relative min-h-screen w-full bg-[#07090e] text-zinc-100 flex flex-col justify-between selection:bg-violet-500/30 selection:text-violet-200 overflow-hidden font-sans">
            <Head title={`${status} · ${config.title} — Relay Studio`} />

            {/* Specular Ambient Obsidian Background Lighting */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-violet-600/10 blur-[140px]" />
            <div className="pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[600px] rounded-full bg-indigo-600/10 blur-[130px]" />
            <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[600px] rounded-full bg-emerald-600/5 blur-[120px]" />

            {/* Minimal Obsidian Top Navigation Bar */}
            <header className="relative z-10 border-b border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-md px-6 py-4">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between">
                    <Link
                        href="/dashboard"
                        className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-600/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.25)]">
                            <Terminal className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-white group-hover:text-zinc-200">
                                Relay Studio
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500">
                                Enterprise PM Engine
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#0c0d12] px-3 py-1 text-xs font-mono text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>System Status: Degraded (HTTP {status})</span>
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Center Stage Error Panel */}
            <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div className="w-full max-w-2xl text-center">
                    {/* Giant Muted Status Code Background Watermark */}
                    <div className="relative mb-4 flex justify-center items-center">
                        <span className="font-mono text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-zinc-800/40 select-none">
                            {status}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-zinc-700/60 bg-[#090a0f] p-4 shadow-2xl backdrop-blur-xl">
                                <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-violet-400" />
                            </div>
                        </div>
                    </div>

                    {/* Status Pill Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-[#0c0d12] px-3.5 py-1 text-xs font-mono font-medium text-zinc-400 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        <span>{config.badge}</span>
                    </div>

                    {/* Headline and Narrative */}
                    <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        {config.title}
                    </h1>
                    <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base leading-relaxed text-zinc-400">
                        {config.description}
                    </p>

                    {/* Interactive Action Controls */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        {/* 1-Click Reload button for 419 */}
                        {status === 419 && (
                            <button
                                type="button"
                                onClick={handleReload}
                                className="group inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all duration-150 hover:bg-violet-500 active:scale-[0.98]"
                            >
                                <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-90" />
                                <span>Reload & Restore Session</span>
                            </button>
                        )}

                        {/* Back to Dashboard */}
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700/80 bg-zinc-800/80 px-5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-100 shadow-sm transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-750 hover:text-white active:scale-[0.98]"
                        >
                            <Home className="h-4 w-4 text-zinc-400" />
                            <span>Back to Dashboard</span>
                        </Link>

                        {/* ⌘K Search Command Trigger */}
                        <button
                            type="button"
                            onClick={handleSearchClick}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#0c0d12] px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 shadow-sm transition-all duration-150 hover:border-zinc-700 hover:bg-[#121318] active:scale-[0.98]"
                        >
                            <Search className="h-4 w-4 text-zinc-400" />
                            <span>Open Search</span>
                            <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-700 bg-zinc-850 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                                ⌘K
                            </kbd>
                        </button>
                    </div>

                    {/* Secondary Navigation Hint */}
                    <div className="mt-8 border-t border-zinc-800/80 pt-6">
                        <p className="text-xs text-zinc-500">
                            Looking for work items? Head to the{' '}
                            <Link
                                href="/requests"
                                className="font-medium text-violet-400 hover:underline"
                            >
                                Tasks Board
                            </Link>{' '}
                            or review your{' '}
                            <Link
                                href="/settings"
                                className="font-medium text-violet-400 hover:underline"
                            >
                                Workspace Settings
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </main>

            {/* Obsidian Footer */}
            <footer className="relative z-10 border-t border-zinc-800/80 bg-[#090a0f]/60 px-6 py-4 text-center text-xs text-zinc-500 font-mono">
                <div className="mx-auto flex max-w-[1600px] flex-col sm:flex-row items-center justify-between gap-2">
                    <span>Relay Studio</span>
                    <span>System Diagnostics · All Systems Operational</span>
                </div>
            </footer>
        </div>
    );
}
