import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GanttTimeline from '@/Components/Roadmap/GanttTimeline';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    Layers,
    CheckCircle2,
    AlertTriangle,
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
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400">
                            <CalendarRange className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-bold text-white tracking-tight">
                                    Roadmap & Visual Gantt
                                </h1>
                                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                                    Q{quarter} {year}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400">
                                Quarterly cross-project execution timeline and dependency map
                            </p>
                        </div>
                    </div>

                    {/* Quarter Switcher Controls */}
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
                                    className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                                        quarter === q
                                            ? 'bg-zinc-800 text-white shadow-sm'
                                            : 'text-zinc-400 hover:text-zinc-200'
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
                </div>
            }
        >
            <Head title={`Roadmap · Q${quarter} ${year}`} />

            <div className="mx-auto max-w-7xl space-y-6">
                {/* Roadmap Summary Overview Pills */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Initiatives
                        </span>
                        <div className="mt-1 font-mono text-2xl font-bold text-white">
                            {projects.length}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">Active project tracks</p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Scheduled Work
                        </span>
                        <div className="mt-1 font-mono text-2xl font-bold text-white">
                            {totalRequests}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">Tickets in quarterly span</p>
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
                            % quarterly completion
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-[#0c0d12] p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                            Roadblocks
                        </span>
                        <div className="mt-1 font-mono text-2xl font-bold text-rose-400">
                            {blockedRequests}
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-500">Blocked or dependent tickets</p>
                    </div>
                </div>

                {/* Quarterly Gantt Timeline */}
                <GanttTimeline
                    projects={projects}
                    requests={requests}
                    quarter={quarter}
                    year={year}
                    quarterStart={quarter_start}
                    quarterEnd={quarter_end}
                />
            </div>
        </AuthenticatedLayout>
    );
}
