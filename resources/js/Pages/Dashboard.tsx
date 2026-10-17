import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { WorkRequestCard } from '@/types/workspace';
import { Head, router, usePage } from '@inertiajs/react';
import {
    DashboardHero,
    DashboardKpiTiles,
    DeliveryVelocityCard,
    InitiativesProgressCard,
    RoadblockAlertBanner,
    DashboardQueuesGrid,
    TeamWorkloadCard,
    DashboardActivityFeed,
    type DashboardStats,
    type VelocityPoint,
    type ProjectStat,
    type TeamMemberWorkload,
    type DashboardActivityItem,
} from '@/Features/Dashboard';

export type {
    DashboardStats,
    VelocityPoint,
    ProjectStat,
    TeamMemberWorkload,
    DashboardActivityItem,
};

export default function Dashboard({
    stats,
    velocity = [],
    projectStats = [],
    statusBreakdown = {},
    teamWorkload = [],
    newRequests = [],
    myAssignedWork = [],
    reviewRequests = [],
    blockedRequests = [],
    urgentRequests = [],
    recentActivity = [],
}: PageProps<{
    stats: DashboardStats;
    velocity?: VelocityPoint[];
    projectStats?: ProjectStat[];
    statusBreakdown?: Record<string, number>;
    teamWorkload?: TeamMemberWorkload[];
    newRequests: WorkRequestCard[];
    myAssignedWork: WorkRequestCard[];
    reviewRequests: WorkRequestCard[];
    blockedRequests: WorkRequestCard[];
    urgentRequests: WorkRequestCard[];
    recentActivity: DashboardActivityItem[];
}>) {
    const { auth } = usePage<PageProps>().props;
    const firstName = auth.user.name.split(' ')[0];

    const advanceRequest = (request: WorkRequestCard, nextStatus: string) => {
        router.patch(
            route('requests.update', request.id),
            { status: nextStatus },
            { preserveScroll: true }
        );
    };

    const unblockRequest = (request: WorkRequestCard) => {
        router.patch(
            route('requests.update', request.id),
            { is_blocked: false, blocked_reason: null },
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                Operations
                            </span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[11px] text-zinc-500">Overview</span>
                        </div>
                        <h1 className="mt-1 text-lg font-semibold text-zinc-100">Studio Dashboard</h1>
                    </div>
                </div>
            }
        >
            <Head title="Executive Command · Studio Pulse" />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Hero Mission Control Banner */}
                <DashboardHero
                    firstName={firstName}
                    stats={stats}
                    statusBreakdown={statusBreakdown}
                />

                {/* 5 Unified Obsidian KPI Tiles */}
                <DashboardKpiTiles stats={stats} />

                {/* Refined Analytics & Initiative Health Grid */}
                <div className="grid gap-6 lg:grid-cols-12">
                    <DeliveryVelocityCard velocity={velocity} />
                    <InitiativesProgressCard projectStats={projectStats} />
                </div>

                {/* Roadblock Banner (if any blocked requests exist) */}
                <RoadblockAlertBanner
                    blockedRequests={blockedRequests}
                    onUnblockLatest={unblockRequest}
                />

                {/* Main Action Queues Grid */}
                <DashboardQueuesGrid
                    stats={stats}
                    newRequests={newRequests}
                    myAssignedWork={myAssignedWork}
                    reviewRequests={reviewRequests}
                    blockedRequests={blockedRequests}
                    urgentRequests={urgentRequests}
                    onAdvanceRequest={advanceRequest}
                    onUnblockRequest={unblockRequest}
                    teamWorkloadSlot={
                        teamWorkload.length > 0 ? (
                            <TeamWorkloadCard teamWorkload={teamWorkload} />
                        ) : undefined
                    }
                    activityFeedSlot={
                        <DashboardActivityFeed recentActivity={recentActivity} />
                    }
                />
            </div>
        </AuthenticatedLayout>
    );
}
