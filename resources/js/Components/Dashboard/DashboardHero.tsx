import { Link } from '@inertiajs/react';
import { ArrowRight, KanbanSquare, Plus, Sparkles } from 'lucide-react';
import { DashboardStats } from './types';

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
    const totalPipeline = Math.max(1, stats.total || 1);
    const pipelineSegments = [
        { label: 'New', count: statusBreakdown.new ?? 0, color: 'bg-zinc-600' },
        { label: 'Ready', count: statusBreakdown.ready ?? 0, color: 'bg-zinc-400' },
        { label: 'In Progress', count: statusBreakdown.doing ?? 0, color: 'bg-indigo-500' },
        { label: 'Review', count: statusBreakdown.review ?? 0, color: 'bg-amber-400' },
        { label: 'Done', count: statusBreakdown.done ?? 0, color: 'bg-emerald-400' },
    ];

    return (
        <section className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111216] p-6 shadow-sm sm:p-7">
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-300">
                        <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Overview · {firstName}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-500" />
                        <span className="text-zinc-400">{stats.total} total requests</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        Command Center
                    </h2>
                    <p className="mt-1.5 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400">
                        Real-time studio throughput, active handoffs, triage queue, and initiative delivery metrics.
                    </p>

                    {/* Status Pipeline Flow */}
                    <div className="mt-5 max-w-lg">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-medium">
                            <span>Pipeline Flow</span>
                            <span className="text-zinc-500">
                                {stats.done} completed ({stats.completion_rate}%)
                            </span>
                        </div>
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 border border-zinc-750">
                            {pipelineSegments.map((segment) => {
                                const widthPct = Math.max(3, (segment.count / totalPipeline) * 100);
                                return (
                                    <div
                                        key={segment.label}
                                        className={`h-full ${segment.color} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                                        style={{ width: `${widthPct}%` }}
                                        title={`${segment.label}: ${segment.count}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[10px] text-zinc-400">
                            {pipelineSegments.map((s) => (
                                <div key={s.label} className="flex items-center gap-1.5">
                                    <span className={`h-1.5 w-1.5 rounded-full ${s.color}`} />
                                    <span>
                                        {s.label}: <strong className="font-semibold text-zinc-200">{s.count}</strong>
                                    </span>
                                </div>
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
