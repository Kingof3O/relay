import { Link } from '@inertiajs/react';
import { ArrowRight, KanbanSquare, Plus, Sparkles } from 'lucide-react';
import { DashboardStats } from '../types';

interface DashboardHeroProps {
    firstName: string;
    stats: DashboardStats;
    statusBreakdown?: Record<string, number>;
}

export default function DashboardHero({
    firstName,
    stats,
    statusBreakdown = {},
}: DashboardHeroProps) {
    const totalPipeline = Math.max(0, stats.total || 0);

    const pipelineSegments = [
        {
            statusKey: 'new',
            label: 'New',
            count: statusBreakdown.new ?? 0,
            barColor: 'bg-zinc-400',
            dotColor: 'bg-zinc-400',
        },
        {
            statusKey: 'ready',
            label: 'Ready',
            count: statusBreakdown.ready ?? 0,
            barColor: 'bg-sky-400',
            dotColor: 'bg-sky-400',
        },
        {
            statusKey: 'doing',
            label: 'In Progress',
            count: statusBreakdown.doing ?? 0,
            barColor: 'bg-indigo-400',
            dotColor: 'bg-indigo-400',
        },
        {
            statusKey: 'review',
            label: 'Review',
            count: statusBreakdown.review ?? 0,
            barColor: 'bg-amber-400',
            dotColor: 'bg-amber-400',
        },
        {
            statusKey: 'done',
            label: 'Done',
            count: statusBreakdown.done ?? 0,
            barColor: 'bg-emerald-400',
            dotColor: 'bg-emerald-400',
        },
    ];

    const activeSegments = pipelineSegments.filter((s) => s.count > 0);

    return (
        <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111216] p-6 shadow-sm sm:p-7">
            {/* Ambient specular glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
                        <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Overview · {firstName}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-500" />
                        <span className="text-zinc-400">{stats.total} total requests</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Command Center
                    </h2>
                    <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400">
                        Overview of your tasks, active projects, and team progress.
                    </p>

                    {/* Status Pipeline Flow */}
                    <div className="mt-5 max-w-xl">
                        <div className="mb-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-300">Delivery Pipeline</span>
                                <span className="text-zinc-600">·</span>
                                <span className="font-mono text-[11px] text-zinc-400">
                                    {stats.total} total {stats.total === 1 ? 'task' : 'tasks'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                                <span className="font-semibold text-emerald-400">
                                    {stats.done} completed
                                </span>
                                <span className="text-zinc-600">({stats.completion_rate}%)</span>
                            </div>
                        </div>

                        {/* Segmented Precision Progress Bar */}
                        <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-zinc-800/50">
                            {activeSegments.length === 0 ? (
                                <div className="h-full w-full bg-zinc-800/40" />
                            ) : (
                                activeSegments.map((segment) => {
                                    const pct = totalPipeline > 0 ? Math.round((segment.count / totalPipeline) * 100) : 0;
                                    return (
                                        <div
                                            key={segment.statusKey}
                                            style={{ flex: segment.count }}
                                            className={`h-full ${segment.barColor} transition-all duration-300 hover:brightness-125`}
                                            title={`${segment.label}: ${segment.count} (${pct}%)`}
                                        />
                                    );
                                })
                            )}
                        </div>

                        {/* Interactive Status Filter Pills */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {pipelineSegments.map((segment) => (
                                <Link
                                    key={segment.statusKey}
                                    href={route('requests.index', { status: segment.statusKey })}
                                    className="group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-xs transition-all duration-150 hover:border-white/[0.14] hover:bg-white/[0.06] active:scale-[0.98]"
                                    title={`Filter ${segment.label} in Kanban`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${segment.dotColor} transition-transform group-hover:scale-125`}
                                    />
                                    <span className="font-medium text-zinc-400 transition-colors group-hover:text-zinc-200">
                                        {segment.label}
                                    </span>
                                    <span className="font-mono text-[11px] font-semibold text-zinc-300 group-hover:text-white">
                                        {segment.count}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-quick-create'))}
                        className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:bg-zinc-200 active:scale-[0.98]"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Work Request</span>
                        <kbd className="rounded bg-zinc-200 px-1 py-0.5 text-[10px] font-mono text-zinc-800">C</kbd>
                    </button>
                    <Link
                        href={route('requests.index')}
                        className="group flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-850 px-4 py-2.5 text-xs font-medium text-zinc-200 shadow-sm transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white active:scale-[0.98]"
                    >
                        <KanbanSquare className="h-4 w-4 text-zinc-400" />
                        <span>Open Kanban Board</span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
