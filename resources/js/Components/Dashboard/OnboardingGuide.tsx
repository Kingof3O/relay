import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    Sparkles,
    Plus,
    Bot,
    Users,
    Layers,
    X,
    ChevronRight,
    Copy,
    Check,
    Terminal,
    ArrowRight,
    ExternalLink,
} from 'lucide-react';
import { PageProps } from '@/types';
import { toast } from 'sonner';

export interface OnboardingStatus {
    hasWorkspace: boolean;
    hasAreas: boolean;
    hasTasks: boolean;
    hasTokens: boolean;
    hasTeammates: boolean;
    isDemoSeeded: boolean;
}

interface OnboardingGuideProps {
    onboarding: OnboardingStatus;
    totalTasks: number;
    onOpenCreateTask?: () => void;
}

export default function OnboardingGuide({
    onboarding,
    totalTasks,
    onOpenCreateTask,
}: OnboardingGuideProps) {
    const { currentWorkspace, auth } = usePage<PageProps>().props;
    const workspaceId = currentWorkspace?.id ?? 'default';

    const [dismissed, setDismissed] = useState<boolean>(true);
    const [seedingDemo, setSeedingDemo] = useState<boolean>(false);
    const [showMcpModal, setShowMcpModal] = useState<boolean>(false);
    const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

    // Initial check from localStorage
    useEffect(() => {
        try {
            const isDismissed = localStorage.getItem(`relay_onboarding_dismissed_${workspaceId}`);
            // If total tasks is 0 or low and not explicitly dismissed, show by default
            if (isDismissed === 'true' && totalTasks > 3) {
                setDismissed(true);
            } else if (isDismissed === 'true') {
                setDismissed(true);
            } else {
                setDismissed(false);
            }
        } catch {
            setDismissed(totalTasks > 3);
        }
    }, [workspaceId, totalTasks]);

    const handleDismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem(`relay_onboarding_dismissed_${workspaceId}`, 'true');
        } catch {
            // ignore
        }
        toast.info('Onboarding guide minimized. Reopen anytime from the dashboard header.');
    };

    const handleRestore = () => {
        setDismissed(false);
        try {
            localStorage.removeItem(`relay_onboarding_dismissed_${workspaceId}`);
        } catch {
            // ignore
        }
    };

    const handleSeedDemo = () => {
        setSeedingDemo(true);
        router.post(
            route('workspaces.seed-demo'),
            {},
            {
                onSuccess: () => {
                    toast.success('Atlas Desktop demo data successfully seeded!');
                    setSeedingDemo(false);
                },
                onError: () => {
                    toast.error('Failed to seed Atlas Desktop demo data.');
                    setSeedingDemo(false);
                },
            }
        );
    };

    const steps = [
        {
            id: 'workspace',
            title: 'Create your first workspace',
            detail: `Active workspace: ${currentWorkspace?.name ?? 'Personal Workspace'}`,
            completed: onboarding.hasWorkspace,
            action: null,
        },
        {
            id: 'areas',
            title: 'Define an Area / Project',
            detail: onboarding.hasAreas
                ? 'Engineering areas configured'
                : 'Group engineering tasks into logical components or services.',
            completed: onboarding.hasAreas,
            action: (
                <Link
                    href={route('settings.index')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                    <span>Manage Projects</span>
                    <ChevronRight className="h-3 w-3" />
                </Link>
            ),
        },
        {
            id: 'tasks',
            title: 'Create your first task (or seed Atlas Desktop demo data)',
            detail: onboarding.hasTasks
                ? `${totalTasks} work requests active in pipeline`
                : 'Start tracking engineering work or populate 32 realistic issues from Atlas Desktop.',
            completed: onboarding.hasTasks,
            action: (
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleSeedDemo}
                        disabled={seedingDemo}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-600/20 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600/30 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] disabled:opacity-50"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-violet-300 animate-pulse" />
                        <span>{seedingDemo ? 'Seeding Atlas Desktop...' : 'Seed Atlas Desktop Demo'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (onOpenCreateTask) {
                                onOpenCreateTask();
                            } else {
                                window.dispatchEvent(new CustomEvent('open-quick-create'));
                            }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>New Task</span>
                        <kbd className="ml-1 rounded bg-white/[0.08] px-1 py-0.2 text-[10px] font-mono text-zinc-400">C</kbd>
                    </button>
                </div>
            ),
        },
        {
            id: 'mcp',
            title: 'Connect your AI coding agent via MCP',
            detail: onboarding.hasTokens
                ? 'MCP API access configured & ready'
                : 'Enable Antigravity, Cursor, or Claude Desktop to inspect tickets & move Kanban cards.',
            completed: onboarding.hasTokens,
            action: (
                <button
                    type="button"
                    onClick={() => setShowMcpModal(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                    <Bot className="h-3 w-3" />
                    <span>MCP Setup Guide</span>
                    <ChevronRight className="h-3 w-3" />
                </button>
            ),
        },
        {
            id: 'team',
            title: 'Invite a teammate',
            detail: onboarding.hasTeammates
                ? 'Team members collaborating in workspace'
                : 'Collaborate with fellow engineers and designers on work requests.',
            completed: onboarding.hasTeammates,
            action: (
                <Link
                    href={route('settings.index')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                    <Users className="h-3 w-3" />
                    <span>Invite Team</span>
                    <ChevronRight className="h-3 w-3" />
                </Link>
            ),
        },
    ];

    const completedCount = steps.filter((s) => s.completed).length;
    const progressPercentage = Math.round((completedCount / steps.length) * 100);

    // If dismissed, show a slim obsidian pill to re-open
    if (dismissed) {
        return (
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#090a0f]/60 px-4 py-2.5 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <Sparkles className="h-3 w-3" />
                    </span>
                    <span className="text-zinc-300 font-medium">Getting Started Guide</span>
                    <span className="text-zinc-500 font-mono text-[11px]">
                        ({completedCount}/{steps.length} completed)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRestore}
                        className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        Show Setup Guide
                    </button>
                </div>
            </div>
        );
    }

    const mcpConfigJson = JSON.stringify(
        {
            mcpServers: {
                relay: {
                    command: 'node',
                    args: ['/Volumes/Main/Herd/stm/mcp-server/dist/index.js'],
                    env: {
                        RELAY_URL: window?.location?.origin ?? 'http://stm.test',
                        RELAY_API_TOKEN: 'YOUR_PERSONAL_ACCESS_TOKEN',
                    },
                },
            },
        },
        null,
        2
    );

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedSnippet(text);
        toast.success('MCP configuration copied to clipboard!');
        setTimeout(() => setCopiedSnippet(null), 2500);
    };

    return (
        <section
            aria-label="Getting Started with Relay Studio"
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-white/[0.04] transition-all"
        >
            {/* Specular top highlight */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent"
                aria-hidden="true"
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
                <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                        <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base font-bold text-white tracking-tight">
                                Getting Started with Relay Studio
                            </h2>
                            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                                <span>{progressPercentage}% Ready</span>
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">
                            Configure your software engineering workspace, invite teammates, and connect autonomous AI agents.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleDismiss}
                        className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
                        title="Dismiss guide"
                    >
                        <X className="h-3.5 w-3.5" />
                        <span>Dismiss</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="my-4">
                <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Steps Checklist */}
            <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-2">
                {steps.map((step, idx) => (
                    <div
                        key={step.id}
                        className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
                            step.completed
                                ? 'border-emerald-500/20 bg-emerald-950/10 text-zinc-300'
                                : 'border-white/[0.06] bg-[#0c0d12]/60 hover:border-white/[0.1] hover:bg-[#0c0d12]/90'
                        }`}
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="font-mono text-[10px] font-semibold text-zinc-500">
                                    Step 0{idx + 1}
                                </span>
                                {step.completed ? (
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                        <CheckCircle2 className="h-4 w-4 fill-emerald-500/20 text-emerald-400" />
                                        <span>Completed</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                                        <Circle className="h-3.5 w-3.5" />
                                        <span>Pending</span>
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xs font-semibold text-zinc-100">{step.title}</h3>
                            <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
                                {step.detail}
                            </p>
                        </div>

                        {step.action && <div className="mt-4 pt-3 border-t border-white/[0.04]">{step.action}</div>}
                    </div>
                ))}
            </div>

            {/* MCP Setup Modal */}
            {showMcpModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in-0 duration-150"
                    onClick={() => setShowMcpModal(false)}
                >
                    <div
                        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] backdrop-blur-2xl ring-1 ring-white/[0.04]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#07090e]/60">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Model Context Protocol (MCP) Setup</h3>
                                    <p className="text-[11px] text-zinc-400">Connect Antigravity, Cursor, or Claude Desktop to Relay</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowMcpModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll text-xs">
                            <div>
                                <h4 className="font-semibold text-zinc-200 mb-1">1. Generate an API Token</h4>
                                <p className="text-zinc-400 text-[11px] mb-2">
                                    Create a personal access token for your AI agent under Profile Settings or run the CLI:
                                </p>
                                <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0c0d12] px-3 py-2 font-mono text-[11px] text-violet-300">
                                    <span>php artisan relay:token</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy('php artisan relay:token')}
                                        className="text-zinc-400 hover:text-white"
                                    >
                                        {copiedSnippet === 'php artisan relay:token' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-zinc-200 mb-1">2. Add to your AI Assistant Configuration</h4>
                                <p className="text-zinc-400 text-[11px] mb-2">
                                    Add this block to your <code>mcp_config.json</code> (Antigravity/Cursor) or <code>claude_desktop_config.json</code>:
                                </p>
                                <div className="relative rounded-xl border border-white/[0.08] bg-[#07090e] p-3 font-mono text-[11px] text-zinc-300">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(mcpConfigJson)}
                                        className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[10px] text-zinc-400 hover:text-white"
                                    >
                                        {copiedSnippet === mcpConfigJson ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                        <span>Copy JSON</span>
                                    </button>
                                    <pre className="overflow-x-auto custom-scroll pt-6">{mcpConfigJson}</pre>
                                </div>
                            </div>

                            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-[11px] text-violet-300 leading-relaxed">
                                ✨ <strong>Autonomous Capabilities:</strong> Once connected, your AI assistant can review daily briefings, inspect tickets, transition cards, and post implementation summaries autonomously.
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/[0.08] bg-[#07090e]/80 px-6 py-3 flex items-center justify-between">
                            <Link
                                href={route('profile.tokens.index')}
                                className="inline-flex items-center gap-1 text-xs text-violet-400 hover:underline"
                            >
                                <span>Go to Personal Access Tokens</span>
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setShowMcpModal(false)}
                                className="rounded-lg border border-white/[0.1] bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/[0.1]"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
