import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import GanttTimeline from '@/Components/Roadmap/GanttTimeline';
import EmptyState from '@/Components/EmptyState';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Layers,
    CheckCircle2,
    AlertTriangle,
    Plus,
    ArrowRight,
} from 'lucide-react';

interface ProjectTimelineItem {
    id: number;
    name: string;
    slug?: string;
    color: string;
    total_requests: number;
    completed_requests: number;
    completion_percentage: number;
    start_date: string;
    due_date: string;
}

interface RequestTimelineItem {
    id: number;
    title: string;
    status: string;
    status_label: string;
    priority: string;
    priority_label: string;
    story_points: number | null;
    is_blocked: boolean;
    blocked_reason?: string | null;
    start_date: string;
    due_date: string;
    project?: { id: number; name: string; color: string } | null;
    assignee?: { id: number; name: string; username: string } | null;
    blocking_ids: number[];
}

interface RoadmapIndexProps extends PageProps {
    projects: ProjectTimelineItem[];
    requests: RequestTimelineItem[];
    year: number;
    quarter: number;
    quarter_start: string;
    quarter_end: string;
}

export default function RoadmapIndex({
    projects,
    requests,
    year,
    quarter,
    quarter_start,
    quarter_end,
}: RoadmapIndexProps) {
    const handlePrevQuarter = () => {
        let prevQ = quarter - 1;
        let prevY = year;
        if (prevQ < 1) {
            prevQ = 4;
            prevY -= 1;
        }
        router.visit(route('roadmap.index', { year: prevY, quarter: prevQ }));
    };

    const handleNextQuarter = () => {
        let nextQ = quarter + 1;
        let nextY = year;
        if (nextQ > 4) {
            nextQ = 1;
            nextY += 1;
        }
        router.visit(route('roadmap.index', { year: nextY, quarter: nextQ }));
    };

    const totalRequests = requests.length;
    const completedRequests = requests.filter((r) => r.status === 'done').length;
    const blockedRequests = requests.filter((r) => r.is_blocked).length;

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    crumbs={[
                        { label: 'Planning', href: route('roadmap.index') },
                        { label: 'Roadmap & Timeline' },
                    ]}
                    title="Roadmap & Timeline"
                    badge={
                        <span className="rounded-full border border-zinc-750 bg-zinc-850 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                            Q{quarter} {year}
                        </span>
                    }
                    subtitle={
                        <span className="hidden md:inline text-xs text-zinc-400">
                            Quarterly timeline of projects, tasks, and dependencies
                        </span>
                    }
                    actions={
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrevQuarter}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#0d0e12] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                                title="Previous Quarter"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#0d0e12] p-1 text-xs">
                                {[1, 2, 3, 4].map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() =>
                                            router.visit(route('roadmap.index', { year, quarter: q }))
                                        }
                                        className={`rounded-lg border px-2.5 py-1 font-semibold transition-all ${
                                            quarter === q
                                                ? 'border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                                : 'border-transparent text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        Q{q}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleNextQuarter}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#0d0e12] text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                                title="Next Quarter"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    }
                />
            }
        >
            <Head title={`Roadmap · Q${quarter} ${year}`} />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* Roadmap Summary Overview Pills */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Projects
                        </span>
                        <div className="mt-1 font-mono text-2xl font-bold text-white">
                            {projects.length}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">Active projects</p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Scheduled Tasks
                        </span>
                        <div className="mt-1 font-mono text-2xl font-bold text-white">
                            {totalRequests}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">Tasks scheduled this quarter</p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Completed
                        </span>
                        <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                            {completedRequests}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">
                            {totalRequests > 0
                                ? Math.round((completedRequests / totalRequests) * 100)
                                : 0}
                            % completed this quarter
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Blocked Tasks
                        </span>
                        <div className="mt-1 font-mono text-2xl font-bold text-rose-400">
                            {blockedRequests}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">Tasks currently blocked</p>
                    </div>
                </div>

                {/* Quarterly Gantt Timeline or Empty State */}
                {totalRequests === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#090a0f]/90 p-12 shadow-xl backdrop-blur-xl">
                        <EmptyState
                            icon={Layers}
                            title="No milestones mapped"
                            description="No milestones mapped. Schedule work requests to a target release horizon."
                            action={
                                <div className="flex flex-wrap items-center justify-center gap-3">
                                    <Link
                                        href={route('requests.index')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 active:scale-[0.98] transition-all"
                                    >
                                        <ArrowRight className="h-3.5 w-3.5" />
                                        <span>Schedule Work Requests</span>
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (typeof window !== 'undefined') {
                                                window.dispatchEvent(new CustomEvent('open-quick-create'));
                                            }
                                        }}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>Create Request</span>
                                    </button>
                                </div>
                            }
                            className="py-8"
                        />
                    </div>
                ) : (
                    <GanttTimeline
                        projects={projects}
                        requests={requests}
                        quarter={quarter}
                        year={year}
                        quarterStart={quarter_start}
                        quarterEnd={quarter_end}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
