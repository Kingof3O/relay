import Card from '@/Components/Card';
import { Link } from '@inertiajs/react';
import { Activity, ArrowRight, Bot } from 'lucide-react';
import { DashboardActivityItem } from './types';

interface DashboardActivityFeedProps {
    recentActivity?: DashboardActivityItem[];
    className?: string;
}

const formatActivityDate = (date?: string | null) =>
    date
        ? new Intl.DateTimeFormat(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          }).format(new Date(date))
        : '';

export default function DashboardActivityFeed({
    recentActivity = [],
    className = 'p-4',
}: DashboardActivityFeedProps) {
    return (
        <Card className={className} hoverable>
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                        <Activity className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Live Stream
                        </p>
                        <h2 className="text-xs font-semibold text-zinc-100">Audit &amp; Activity Log</h2>
                    </div>
                </div>
                <Link
                    className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-850 px-2 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                    href={route('requests.index')}
                >
                    <span>All Work</span>
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
            {recentActivity.length > 0 ? (
                <div className="mt-2 divide-y divide-zinc-800/60">
                    {recentActivity.slice(0, 6).map((activity) => {
                        const isAgent = Boolean(
                            activity.is_agent ||
                            activity.type === 'agent_action' ||
                            activity.metadata?.is_agent
                        );

                        return (
                            <Link
                                key={activity.id}
                                href={route('requests.show', activity.request_id)}
                                className="block rounded-lg px-2.5 py-2 transition-colors duration-150 hover:bg-zinc-850/40"
                            >
                                <div className="flex items-start gap-2.5">
                                    <div
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${
                                            isAgent
                                                ? 'border border-violet-500/40 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/20'
                                                : 'border border-zinc-700 bg-zinc-800 text-zinc-300'
                                        }`}
                                    >
                                        {isAgent ? (
                                            <Bot className="h-2.5 w-2.5 text-white" />
                                        ) : (
                                            (activity.user?.name ?? 'S').charAt(0)
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="line-clamp-1 text-xs font-medium text-zinc-200">
                                                {activity.body || activity.type.replaceAll('_', ' ')}
                                            </p>
                                            {isAgent && (
                                                <span className="inline-flex shrink-0 items-center gap-0.5 rounded border border-violet-500/40 bg-violet-500/15 px-1 py-0.5 text-[9px] font-semibold text-violet-300">
                                                    <Bot className="h-2.5 w-2.5 text-violet-400" />
                                                    <span>Agent</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                                            <span className="font-medium text-zinc-400">
                                                {activity.user?.name ?? 'System'}
                                            </span>
                                            <span>·</span>
                                            <span className="truncate text-zinc-400">
                                                {activity.request_title}
                                            </span>
                                            {activity.created_at && (
                                                <>
                                                    <span>·</span>
                                                    <span className="text-zinc-500">
                                                        {formatActivityDate(activity.created_at)}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-xs font-normal text-zinc-500">Activity feed will stream here.</p>
                </div>
            )}
        </Card>
    );
}
