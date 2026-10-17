import { Link } from '@inertiajs/react';
import {
    AlertOctagon,
    ArrowRight,
    CheckCircle2,
    Clock,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { DashboardStats } from './types';

interface DashboardKpiTilesProps {
    stats: DashboardStats;
}

export default function DashboardKpiTiles({ stats }: DashboardKpiTilesProps) {
    const metrics = [
        {
            label: 'New requests',
            value: stats.new,
            icon: Sparkles,
            detail: 'Needs triage',
            href: route('requests.index', { status: 'new' }),
        },
        {
            label: 'My work queue',
            value: stats.my_work,
            icon: CheckCircle2,
            detail: 'Active assignments',
            href: route('requests.index', { my_work: '1' }),
        },
        {
            label: 'Awaiting review',
            value: stats.review,
            icon: Clock,
            detail: 'Quality sign-off',
            href: route('requests.index', { status: 'review' }),
        },
        {
            label: 'Roadblocks',
            value: stats.blocked,
            icon: AlertOctagon,
            detail: stats.blocked > 0 ? 'Requires attention' : 'No blockers',
            href: route('requests.index', { blocked: '1' }),
            hasAlert: stats.blocked > 0,
        },
        {
            label: 'Completion rate',
            value: `${stats.completion_rate ?? 0}%`,
            icon: TrendingUp,
            detail: `${stats.done ?? 0} of ${stats.total ?? 0} delivered`,
            href: route('requests.index', { status: 'done' }),
        },
    ];

    return (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                    <Link
                        key={metric.label}
                        href={metric.href}
                        className="group relative flex flex-col justify-between rounded-xl border border-white/[0.07] bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c]"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                                <Icon className="h-4 w-4" />
                            </div>
                            {metric.hasAlert ? (
                                <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">
                                    Action needed
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
                                    View <ArrowRight className="h-3 w-3" />
                                </span>
                            )}
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-medium text-zinc-400">
                                {metric.label}
                            </p>
                            <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                                {metric.value}
                            </p>
                            <p className="mt-1 text-[11px] text-zinc-500">{metric.detail}</p>
                        </div>
                    </Link>
                );
            })}
        </section>
    );
}
