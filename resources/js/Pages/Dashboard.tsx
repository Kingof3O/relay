import PageHeader from '@/Components/PageHeader';
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
import OnboardingGuide, { type OnboardingStatus } from '@/Components/Dashboard/OnboardingGuide';
import { useEffect, useState } from 'react';

export type {
    DashboardStats,
    VelocityPoint,
    ProjectStat,
    TeamMemberWorkload,
    DashboardActivityItem,
};

export default function Dashboard({
    onboarding,
    stats: initialStats,
    velocity = [],
    projectStats = [],
    statusBreakdown = {},
    teamWorkload = [],
    newRequests: initialNewRequests = [],
    myAssignedWork: initialMyAssignedWork = [],
    reviewRequests: initialReviewRequests = [],
    blockedRequests: initialBlockedRequests = [],
    urgentRequests: initialUrgentRequests = [],
    recentActivity: initialRecentActivity = [],
}: PageProps<{
    onboarding?: OnboardingStatus;
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
    const { auth, currentWorkspace } = usePage<PageProps>().props;
    const authUser = auth?.user;
    const firstName = authUser?.name ? authUser.name.split(' ')[0] : 'User';

    const [stats, setStats] = useState<DashboardStats>(initialStats);
    const [newRequests, setNewRequests] = useState<WorkRequestCard[]>(initialNewRequests);
    const [myAssignedWork, setMyAssignedWork] = useState<WorkRequestCard[]>(initialMyAssignedWork);
    const [reviewRequests, setReviewRequests] = useState<WorkRequestCard[]>(initialReviewRequests);
    const [blockedRequests, setBlockedRequests] = useState<WorkRequestCard[]>(initialBlockedRequests);
    const [urgentRequests, setUrgentRequests] = useState<WorkRequestCard[]>(initialUrgentRequests);
    const [recentActivity, setRecentActivity] = useState<DashboardActivityItem[]>(initialRecentActivity);

    // Sync state with Inertia page updates
    useEffect(() => {
        setStats(initialStats);
        setNewRequests(initialNewRequests);
        setMyAssignedWork(initialMyAssignedWork);
        setReviewRequests(initialReviewRequests);
        setBlockedRequests(initialBlockedRequests);
        setUrgentRequests(initialUrgentRequests);
        setRecentActivity(initialRecentActivity);
    }, [
        initialStats,
        initialNewRequests,
        initialMyAssignedWork,
        initialReviewRequests,
        initialBlockedRequests,
        initialUrgentRequests,
        initialRecentActivity,
    ]);

    // Real-time synchronization via Laravel Echo workspace channel
    useEffect(() => {
        const echo = (window as unknown as { Echo?: any }).Echo;
        if (!echo || !currentWorkspace?.id) return;

        try {
            const channelName = `workspace.${currentWorkspace.id}`;
            const channel = echo.private(channelName);

            const handleWorkRequestCreated = (e: { request?: WorkRequestCard; actor_id?: number }) => {
                const req = e?.request;
                if (!req) return;

                // 1. Update blocker count if request.is_blocked
                if (req.is_blocked) {
                    setBlockedRequests((prev) => {
                        if (prev.some((r) => r.id === req.id)) {
                            return prev.map((r) => (r.id === req.id ? req : r));
                        }
                        return [req, ...prev];
                    });
                    setStats((prev) => ({ ...prev, blocked: prev.blocked + 1 }));
                }

                // 2. If assigned to authUser.id, add to "My Work" section
                const isAssignedToMe =
                    authUser?.id &&
                    (req.assignee_id === authUser.id || req.assignee?.id === authUser.id);
                if (isAssignedToMe && req.status !== 'done') {
                    setMyAssignedWork((prev) => {
                        if (prev.some((r) => r.id === req.id)) {
                            return prev.map((r) => (r.id === req.id ? req : r));
                        }
                        return [req, ...prev];
                    });
                    setStats((prev) => ({ ...prev, my_work: prev.my_work + 1 }));
                }

                // 3. Update queues & stats
                if (req.status === 'new') {
                    setNewRequests((prev) => {
                        if (prev.some((r) => r.id === req.id)) {
                            return prev.map((r) => (r.id === req.id ? req : r));
                        }
                        return [req, ...prev];
                    });
                    setStats((prev) => ({ ...prev, new: prev.new + 1 }));
                }

                if (req.priority === 'urgent' && req.status !== 'done') {
                    setUrgentRequests((prev) => {
                        if (prev.some((r) => r.id === req.id)) {
                            return prev.map((r) => (r.id === req.id ? req : r));
                        }
                        return [req, ...prev];
                    });
                    setStats((prev) => ({ ...prev, urgent: prev.urgent + 1 }));
                }

                setStats((prev) => ({ ...prev, total: prev.total + 1 }));

                // 4. Prepend a new activity entry to recent activity feed
                const newActivity: DashboardActivityItem = {
                    id: Date.now(),
                    request_id: req.id,
                    request_title: req.title,
                    type: 'request_created',
                    body: `Created task #${req.id}: ${req.title}`,
                    user: req.requester ? { id: req.requester.id, name: req.requester.name } : null,
                    created_at: new Date().toISOString(),
                };
                setRecentActivity((prev) => [newActivity, ...prev.slice(0, 9)]);
            };

            const handleWorkRequestMoved = (e: {
                request?: WorkRequestCard;
                actor_id?: number;
                from_status?: string;
                to_status?: string;
                status?: string;
            }) => {
                const req = e?.request;
                if (!req) return;

                // 1. Update blocker count if request.is_blocked changes
                const isNowBlocked = Boolean(req.is_blocked);
                setBlockedRequests((prev) => {
                    const wasBlocked = prev.some((r) => r.id === req.id);
                    if (isNowBlocked && !wasBlocked) {
                        setStats((prevStats) => ({ ...prevStats, blocked: prevStats.blocked + 1 }));
                        return [req, ...prev];
                    } else if (!isNowBlocked && wasBlocked) {
                        setStats((prevStats) => ({ ...prevStats, blocked: Math.max(0, prevStats.blocked - 1) }));
                        return prev.filter((r) => r.id !== req.id);
                    } else if (isNowBlocked && wasBlocked) {
                        return prev.map((r) => (r.id === req.id ? req : r));
                    }
                    return prev;
                });

                // 2. If assigned to authUser.id, add to or update "My Work" section
                const isAssignedToMe =
                    authUser?.id &&
                    (req.assignee_id === authUser.id || req.assignee?.id === authUser.id);
                const isDone = req.status === 'done';

                setMyAssignedWork((prev) => {
                    const wasInMyWork = prev.some((r) => r.id === req.id);
                    if (isAssignedToMe && !isDone) {
                        if (wasInMyWork) {
                            return prev.map((r) => (r.id === req.id ? req : r));
                        } else {
                            setStats((prevStats) => ({ ...prevStats, my_work: prevStats.my_work + 1 }));
                            return [req, ...prev];
                        }
                    } else {
                        if (wasInMyWork) {
                            setStats((prevStats) => ({ ...prevStats, my_work: Math.max(0, prevStats.my_work - 1) }));
                            return prev.filter((r) => r.id !== req.id);
                        }
                        return prev;
                    }
                });

                // 3. Update queues (review, new, urgent) & stats
                setReviewRequests((prev) => {
                    const wasReview = prev.some((r) => r.id === req.id);
                    if (req.status === 'review') {
                        if (!wasReview) {
                            setStats((prevStats) => ({ ...prevStats, review: prevStats.review + 1 }));
                            return [req, ...prev];
                        }
                        return prev.map((r) => (r.id === req.id ? req : r));
                    } else {
                        if (wasReview) {
                            setStats((prevStats) => ({ ...prevStats, review: Math.max(0, prevStats.review - 1) }));
                            return prev.filter((r) => r.id !== req.id);
                        }
                        return prev;
                    }
                });

                setNewRequests((prev) => {
                    const wasNew = prev.some((r) => r.id === req.id);
                    if (req.status === 'new') {
                        if (!wasNew) {
                            setStats((prevStats) => ({ ...prevStats, new: prevStats.new + 1 }));
                            return [req, ...prev];
                        }
                        return prev.map((r) => (r.id === req.id ? req : r));
                    } else {
                        if (wasNew) {
                            setStats((prevStats) => ({ ...prevStats, new: Math.max(0, prevStats.new - 1) }));
                            return prev.filter((r) => r.id !== req.id);
                        }
                        return prev;
                    }
                });

                const isUrgent = req.priority === 'urgent' && req.status !== 'done';
                setUrgentRequests((prev) => {
                    const wasUrgent = prev.some((r) => r.id === req.id);
                    if (isUrgent) {
                        if (!wasUrgent) {
                            setStats((prevStats) => ({ ...prevStats, urgent: prevStats.urgent + 1 }));
                            return [req, ...prev];
                        }
                        return prev.map((r) => (r.id === req.id ? req : r));
                    } else {
                        if (wasUrgent) {
                            setStats((prevStats) => ({ ...prevStats, urgent: Math.max(0, prevStats.urgent - 1) }));
                            return prev.filter((r) => r.id !== req.id);
                        }
                        return prev;
                    }
                });

                // Update done count & completion_rate if status moved to/from done
                if (e.from_status !== 'done' && req.status === 'done') {
                    setStats((prevStats) => {
                        const newDone = (prevStats.done ?? 0) + 1;
                        const completionRate =
                            prevStats.total > 0 ? Math.round((newDone / prevStats.total) * 100) : 0;
                        return { ...prevStats, done: newDone, completion_rate: completionRate };
                    });
                } else if (e.from_status === 'done' && req.status !== 'done') {
                    setStats((prevStats) => {
                        const newDone = Math.max(0, (prevStats.done ?? 0) - 1);
                        const completionRate =
                            prevStats.total > 0 ? Math.round((newDone / prevStats.total) * 100) : 0;
                        return { ...prevStats, done: newDone, completion_rate: completionRate };
                    });
                }

                // 4. Prepend a new activity entry to recent activity feed
                const toLabel = req.status_label || req.status;
                const movedActivity: DashboardActivityItem = {
                    id: Date.now(),
                    request_id: req.id,
                    request_title: req.title,
                    type: 'status_changed',
                    body: `Moved task #${req.id} to ${toLabel}`,
                    user:
                        e.actor_id && authUser?.id === e.actor_id
                            ? { id: authUser.id, name: authUser.name }
                            : req.assignee
                            ? { id: req.assignee.id, name: req.assignee.name }
                            : null,
                    created_at: new Date().toISOString(),
                };
                setRecentActivity((prev) => [movedActivity, ...prev.slice(0, 9)]);
            };

            const handleWorkRequestDeleted = (e: { request_id: number }) => {
                if (!e?.request_id) return;
                const reqId = e.request_id;
                setNewRequests((prev) => prev.filter((r) => r.id !== reqId));
                setMyAssignedWork((prev) => prev.filter((r) => r.id !== reqId));
                setReviewRequests((prev) => prev.filter((r) => r.id !== reqId));
                setBlockedRequests((prev) => prev.filter((r) => r.id !== reqId));
                setUrgentRequests((prev) => prev.filter((r) => r.id !== reqId));
            };

            channel.listen('.WorkRequestCreated', handleWorkRequestCreated);
            channel.listen('.WorkRequestMoved', handleWorkRequestMoved);
            channel.listen('.WorkRequestDeleted', handleWorkRequestDeleted);

            return () => {
                echo.leave(channelName);
            };
        } catch {
            // Graceful fallback
        }
    }, [currentWorkspace?.id, authUser?.id]);

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
                <PageHeader
                    crumbs={[
                        { label: 'Operations', href: route('dashboard') },
                        { label: 'Overview' },
                    ]}
                    title="Studio Dashboard"
                />
            }
        >
            <Head title="Dashboard · Overview" />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Sleek First-Run Onboarding Setup Guide */}
                <OnboardingGuide
                    onboarding={
                        onboarding ?? {
                            hasWorkspace: Boolean(currentWorkspace),
                            hasAreas: projectStats.length > 0,
                            hasTasks: stats.total > 0,
                            hasTokens: false,
                            hasTeammates: teamWorkload.length > 1,
                            isDemoSeeded: false,
                        }
                    }
                    totalTasks={stats.total}
                    onOpenCreateTask={() => {
                        window.dispatchEvent(new CustomEvent('open-quick-create'));
                    }}
                />

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
