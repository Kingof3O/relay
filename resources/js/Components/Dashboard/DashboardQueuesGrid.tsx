import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import { WorkRequestCard } from '@/types/workspace';
import { Link } from '@inertiajs/react';
import {
    AlertOctagon,
    Check,
    CheckCircle2,
    Clock,
    Flame,
    Play,
    Sparkles,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import DashboardActivityFeed from './DashboardActivityFeed';
import TeamWorkloadCard from './TeamWorkloadCard';
import { DashboardActivityItem, DashboardStats, TeamMemberWorkload } from './types';

export type QueueFilter = 'all' | 'triage' | 'my_work' | 'review' | 'blocked';

export function ActionableRequestRow({
    request,
    onAdvance,
    actionLabel,
    actionIcon: ActionIcon,
}: {
    request: WorkRequestCard;
    onAdvance?: (request: WorkRequestCard) => void;
    actionLabel?: string;
    actionIcon?: any;
}) {
    const priorityDot =
        request.priority === 'urgent'
            ? 'bg-rose-500'
            : request.status === 'review'
            ? 'bg-amber-400'
            : request.status === 'done'
            ? 'bg-emerald-400'
            : 'bg-zinc-400';

    return (
        <div className="group relative flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-zinc-800 hover:bg-zinc-850/40">
            <Link
                href={route('requests.show', request.id)}
                className="flex min-w-0 flex-1 items-center gap-3"
            >
                <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot}`} />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-zinc-200 transition-colors group-hover:text-white">
                        {request.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                        {request.project && (
                            <span className="flex items-center gap-1.5 truncate text-zinc-400">
                                <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: request.project.color ?? '#71717a' }}
                                />
                                {request.project.name}
                            </span>
                        )}
                        <span>·</span>
                        <span className="truncate text-zinc-400">
                            {request.assignee?.name ?? 'Unassigned'}
                        </span>
                        {request.is_blocked && (
                            <>
                                <span>·</span>
                                <span className="font-medium text-rose-400">Blocked</span>
                            </>
                        )}
                    </div>
                </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
                <Badge
                    variant={
                        request.priority === 'urgent'
                            ? 'rose'
                            : request.status === 'review'
                            ? 'amber'
                            : request.status === 'done'
                            ? 'emerald'
                            : 'zinc'
                    }
                >
                    {request.priority === 'urgent' ? 'Urgent' : request.status_label}
                </Badge>

                {onAdvance && actionLabel && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAdvance(request);
                        }}
                        className="hidden items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white group-hover:flex"
                        title={actionLabel}
                    >
                        {ActionIcon && <ActionIcon className="h-3 w-3 text-zinc-400" />}
                        <span>{actionLabel}</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export function SectionQueue({
    eyebrow,
    title,
    count,
    requests,
    empty,
    href,
    icon: Icon,
    actionLabel,
    actionIcon,
    onAdvance,
}: {
    eyebrow: string;
    title: string;
    count: number;
    requests: WorkRequestCard[];
    empty: string;
    href: string;
    icon: any;
    actionLabel?: string;
    actionIcon?: any;
    onAdvance?: (request: WorkRequestCard) => void;
}) {
    return (
        <Card className="p-4" hoverable>
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            {eyebrow}
                        </p>
                        <h2 className="text-xs font-semibold text-zinc-100">{title}</h2>
                    </div>
                </div>
                <Link
                    href={href}
                    className="flex h-6 min-w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-850 px-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                >
                    {count}
                </Link>
            </div>
            {requests.length > 0 ? (
                <div className="mt-2 space-y-1">
                    {requests.slice(0, 5).map((request) => (
                        <ActionableRequestRow
                            key={request.id}
                            request={request}
                            actionLabel={actionLabel}
                            actionIcon={actionIcon}
                            onAdvance={onAdvance}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-xs font-normal text-zinc-500">{empty}</p>
                </div>
            )}
        </Card>
    );
}

export interface DashboardQueuesGridProps {
    stats: DashboardStats;
    newRequests: WorkRequestCard[];
    myAssignedWork: WorkRequestCard[];
    reviewRequests: WorkRequestCard[];
    blockedRequests: WorkRequestCard[];
    urgentRequests: WorkRequestCard[];
    teamWorkload?: TeamMemberWorkload[];
    recentActivity?: DashboardActivityItem[];
    teamWorkloadSlot?: React.ReactNode;
    activityFeedSlot?: React.ReactNode;
    onAdvanceRequest: (request: WorkRequestCard, nextStatus: string) => void;
    onUnblockRequest: (request: WorkRequestCard) => void;
}

export default function DashboardQueuesGrid({
    stats,
    newRequests,
    myAssignedWork,
    reviewRequests,
    blockedRequests,
    urgentRequests,
    teamWorkload = [],
    recentActivity = [],
    teamWorkloadSlot,
    activityFeedSlot,
    onAdvanceRequest,
    onUnblockRequest,
}: DashboardQueuesGridProps) {
    const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');

    return (
        <div className="space-y-4">
            {/* Queue Filter Navigation Pills (Linear Segmented Style) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-[#0d0e12] p-1">
                    <button
                        type="button"
                        onClick={() => setQueueFilter('all')}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            queueFilter === 'all'
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        All Tasks
                    </button>
                    <button
                        type="button"
                        onClick={() => setQueueFilter('triage')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            queueFilter === 'triage'
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <span>New</span>
                        <span className="rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300">{stats.new}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setQueueFilter('my_work')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            queueFilter === 'my_work'
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <span>My Tasks</span>
                        <span className="rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300">{stats.my_work}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setQueueFilter('review')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            queueFilter === 'review'
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <span>In Review</span>
                        <span className="rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300">{stats.review}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setQueueFilter('blocked')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            queueFilter === 'blocked'
                                ? 'bg-zinc-800 text-rose-300 shadow-sm border border-rose-900/40'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <span>Blocked</span>
                        <span className="rounded bg-zinc-700/60 px-1 text-[10px] text-zinc-300">{stats.blocked}</span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Zap className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Hover a task for quick actions</span>
                </div>
            </div>

            {/* Main Action Queues Grid */}
            <div className="grid gap-4 xl:grid-cols-2">
                {(queueFilter === 'all' || queueFilter === 'triage') && (
                    <SectionQueue
                        eyebrow="New"
                        title="New Tasks"
                        count={stats.new}
                        requests={newRequests}
                        empty="No new tasks waiting for review."
                        href={route('requests.index', { status: 'new' })}
                        icon={Sparkles}
                        actionLabel="Pick Up"
                        actionIcon={Play}
                        onAdvance={(req) => onAdvanceRequest(req, 'ready')}
                    />
                )}

                {(queueFilter === 'all' || queueFilter === 'my_work') && (
                    <SectionQueue
                        eyebrow="Assigned"
                        title="My Tasks"
                        count={stats.my_work}
                        requests={myAssignedWork}
                        empty="Your active queue is clear."
                        href={route('requests.index', { my_work: '1' })}
                        icon={CheckCircle2}
                        actionLabel="Send to Review"
                        actionIcon={Clock}
                        onAdvance={(req) => onAdvanceRequest(req, 'review')}
                    />
                )}

                {(queueFilter === 'all' || queueFilter === 'review') && (
                    <SectionQueue
                        eyebrow="Review"
                        title="Tasks in Review"
                        count={stats.review}
                        requests={reviewRequests}
                        empty="No tasks awaiting approval."
                        href={route('requests.index', { status: 'review' })}
                        icon={Clock}
                        actionLabel="Approve"
                        actionIcon={Check}
                        onAdvance={(req) => onAdvanceRequest(req, 'done')}
                    />
                )}

                {(queueFilter === 'all' || queueFilter === 'blocked') && (
                    <SectionQueue
                        eyebrow="Blocked"
                        title="Blocked Tasks"
                        count={stats.blocked}
                        requests={blockedRequests}
                        empty="No blocked tasks."
                        href={route('requests.index', { blocked: '1' })}
                        icon={AlertOctagon}
                        actionLabel="Unblock"
                        actionIcon={Check}
                        onAdvance={onUnblockRequest}
                    />
                )}

                {queueFilter === 'all' && (
                    <SectionQueue
                        eyebrow="Expedite"
                        title="Urgent Requests"
                        count={stats.urgent}
                        requests={urgentRequests}
                        empty="No high-urgency requests right now."
                        href={route('requests.index', { priority: 'urgent' })}
                        icon={Flame}
                    />
                )}

                {/* Team Pod Workload Summary */}
                {queueFilter === 'all' && (
                    teamWorkloadSlot !== undefined ? (
                        teamWorkloadSlot
                    ) : teamWorkload.length > 0 ? (
                        <TeamWorkloadCard teamWorkload={teamWorkload} />
                    ) : null
                )}

                {/* Live Stream Activity Feed */}
                {activityFeedSlot !== undefined ? (
                    activityFeedSlot
                ) : (
                    <DashboardActivityFeed recentActivity={recentActivity} />
                )}
            </div>
        </div>
    );
}
