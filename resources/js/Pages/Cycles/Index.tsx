import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CycleBurndownChart from '@/Components/Cycles/CycleBurndownChart';
import Badge from '@/Components/Badge';
import { PageProps, WorkRequestCard } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Repeat,
    Calendar,
    Flame,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ArrowRight,
    RotateCcw,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CycleItem {
    id: number;
    number: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    completed_at?: string | null;
}

interface BurndownData {
    cycle: CycleItem;
    metrics: {
        total_points: number;
        completed_points: number;
        remaining_points: number;
        total_tickets: number;
        completed_tickets: number;
        rolled_over_tickets: number;
        completion_percentage: number;
        velocity_points_per_day: number;
    };
    days: Array<{
        day: number;
        date: string;
        label: string;
        ideal: number;
        actual: number | null;
        is_today: boolean;
        is_future: boolean;
    }>;
}

interface CyclesIndexProps extends PageProps {
    currentCycle: CycleItem;
    cycles: CycleItem[];
    burndown: BurndownData;
    tickets: WorkRequestCard[];
}

export default function CyclesIndex({
    currentCycle,
    cycles,
    burndown,
    tickets,
}: CyclesIndexProps) {
    const [rollingOver, setRollingOver] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const handleRollover = () => {
        if (!confirm(`Are you sure you want to rollover Cycle #${currentCycle.number}? Unfinished tickets will be rolled over to the next cycle.`)) {
            return;
        }

        setRollingOver(true);
        router.post(
            route('cycles.rollover', currentCycle.id),
            {},
            {
                onSuccess: () => toast.success('Cycle rolled over successfully!'),
                onError: () => toast.error('Could not rollover cycle.'),
                onFinish: () => setRollingOver(false),
            }
        );
    };

    const filteredTickets = tickets.filter((t) => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'done') return t.status === 'done';
        if (filterStatus === 'uncompleted') return t.status !== 'done';
        return t.status === filterStatus;
    });

    const metrics = burndown.metrics;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400">
                            <Repeat className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-white tracking-tight">
                                    {currentCycle.name}
                                </h1>
                                {currentCycle.is_active ? (
                                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Active Cycle
                                    </span>
                                ) : (
                                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                                        Completed
                                    </span>
                                )}
                            </div>
                            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                                <Calendar className="h-3 w-3 text-zinc-500" />
                                <span>
                                    {currentCycle.start_date} – {currentCycle.end_date} (14 days)
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Cycle Selector & Actions */}
                    <div className="flex items-center gap-2.5">
                        <select
                            value={currentCycle.id}
                            onChange={(e) =>
                                router.visit(route('cycles.index', { cycle_id: e.target.value }))
                            }
                            className="rounded-xl border border-zinc-800 bg-[#0d0e12] px-3 py-1.5 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:outline-none"
                        >
                            {cycles.map((c) => (
                                <option key={c.id} value={c.id}>
                                    Cycle {c.number}: {c.name} {c.is_active ? '★ Active' : ''}
                                </option>
                            ))}
                        </select>

                        {currentCycle.is_active && (
                            <button
                                type="button"
                                disabled={rollingOver}
                                onClick={handleRollover}
                                className="flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-600/20 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600/30 hover:text-white transition-all disabled:opacity-50"
                                title="Close this cycle and rollover unfinished tickets to the next cycle"
                            >
                                <RotateCcw className={`h-3.5 w-3.5 ${rollingOver ? 'animate-spin' : ''}`} />
                                <span>{rollingOver ? 'Rolling Over…' : 'Rollover Cycle'}</span>
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Cycles · ${currentCycle.name}`} />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Agile Velocity KPI Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Scope & Points
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-bold text-white">
                                {metrics.completed_points}
                            </span>
                            <span className="font-mono text-xs text-zinc-500">
                                / {metrics.total_points} pts
                            </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full bg-violet-500 rounded-full transition-all duration-300"
                                    style={{ width: `${metrics.completion_percentage}%` }}
                                />
                            </div>
                            <span className="font-mono text-[10px] text-zinc-400">
                                {metrics.completion_percentage}%
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Tasks Completed
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-bold text-white">
                                {metrics.completed_tickets}
                            </span>
                            <span className="font-mono text-xs text-zinc-500">
                                / {metrics.total_tickets}
                            </span>
                        </div>
                        <p className="mt-2 text-[11px] text-zinc-500">
                            {metrics.total_tickets - metrics.completed_tickets} remaining in cycle
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Points Per Day
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-bold text-emerald-400">
                                {metrics.velocity_points_per_day}
                            </span>
                            <span className="font-mono text-xs text-zinc-500">pts / day</span>
                        </div>
                        <p className="mt-2 text-[11px] text-zinc-500">
                            Average points completed per day
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Rolled Over
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-mono text-2xl font-bold text-amber-300">
                                {metrics.rolled_over_tickets}
                            </span>
                            <span className="font-mono text-xs text-zinc-500">tickets</span>
                        </div>
                        <p className="mt-2 text-[11px] text-zinc-500">
                            Carried over from prior cycles
                        </p>
                    </div>
                </div>

                {/* Burndown Velocity Chart */}
                <CycleBurndownChart data={burndown} />

                {/* Sprint Backlog / Ticket List */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-5 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white">
                                Cycle Tasks ({filteredTickets.length})
                            </h2>
                        </div>

                        <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#07090e] p-1 text-xs">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'uncompleted', label: 'Remaining' },
                                { key: 'done', label: 'Done' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setFilterStatus(tab.key)}
                                    className={`rounded-lg border px-3 py-1 font-medium text-xs transition-all ${
                                        filterStatus === tab.key
                                            ? 'border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                            : 'border-transparent text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3 divide-y divide-white/[0.04]">
                        {filteredTickets.length > 0 ? (
                            filteredTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="group flex items-center justify-between gap-3 py-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="font-mono text-xs font-bold text-zinc-500 group-hover:text-violet-300">
                                            #{ticket.id}
                                        </span>

                                        <Link
                                            href={route('requests.show', ticket.id)}
                                            className="truncate text-xs font-medium text-zinc-200 hover:text-white"
                                        >
                                            {ticket.title}
                                        </Link>

                                        {ticket.rolled_over_from_cycle_id && (
                                            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 shrink-0">
                                                Rolled Over
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 text-xs">
                                        {ticket.subtasks_progress && ticket.subtasks_progress.total > 0 && (
                                            <span className="font-mono text-[11px] text-zinc-400">
                                                {ticket.subtasks_progress.completed}/{ticket.subtasks_progress.total} subtasks
                                            </span>
                                        )}

                                        {ticket.story_points !== null && ticket.story_points !== undefined && (
                                            <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-violet-300">
                                                {ticket.story_points} pts
                                            </span>
                                        )}

                                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                                            {ticket.status_label}
                                        </span>

                                        {ticket.assignee ? (
                                            <div
                                                className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[9px] font-semibold text-zinc-200"
                                                title={ticket.assignee.name}
                                            >
                                                {ticket.assignee.name.charAt(0)}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-zinc-500">Unassigned</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-xs text-zinc-500">
                                No tasks found for this cycle and filter.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
