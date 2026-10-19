import {
    AlertOctagon,
    ArrowRight,
    CheckCircle2,
    Clock,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { DashboardStats } from '../types';
import KpiTile from '@/Components/KpiTile';

interface DashboardKpiTilesProps {
    stats: DashboardStats;
}

export default function DashboardKpiTiles({ stats }: DashboardKpiTilesProps) {
    const metrics = [
        {
            label: 'New requests',
            value: stats.new,
            icon: Sparkles,
            detail: 'Needs review',
            href: route('requests.index', { status: 'new' }),
        },
        {
            label: 'My tasks',
            value: stats.my_work,
            icon: CheckCircle2,
            detail: 'Assigned to you',
            href: route('requests.index', { my_work: '1' }),
        },
        {
            label: 'In review',
            value: stats.review,
            icon: Clock,
            detail: 'Ready for review',
            href: route('requests.index', { status: 'review' }),
        },
        {
            label: 'Blocked tasks',
            value: stats.blocked,
            icon: AlertOctagon,
            detail: stats.blocked > 0 ? 'Needs attention' : 'No blockers',
            href: route('requests.index', { blocked: '1' }),
            hasAlert: stats.blocked > 0,
        },
        {
            label: 'Completion rate',
            value: `${stats.completion_rate ?? 0}%`,
            icon: TrendingUp,
            detail: `${stats.done ?? 0} of ${stats.total ?? 0} completed`,
            href: route('requests.index', { status: 'done' }),
        },
    ];

    return (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => (
                <KpiTile
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    icon={metric.icon}
                    detail={metric.detail}
                    href={metric.href}
                    badge={
                        metric.hasAlert ? (
                            <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">
                                Action needed
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
                                View <ArrowRight className="h-3 w-3" />
                            </span>
                        )
                    }
                />
            ))}
        </section>
    );
}
