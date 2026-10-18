import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Layers,
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

interface GanttTimelineProps {
    projects: ProjectTimelineItem[];
    requests: RequestTimelineItem[];
    quarter: number;
    year: number;
    quarterStart: string;
    quarterEnd: string;
}

export default function GanttTimeline({
    projects,
    requests,
    quarter,
    year,
    quarterStart,
    quarterEnd,
}: GanttTimelineProps) {
    const [selectedProject, setSelectedProject] = useState<number | 'all'>('all');

    const qStart = useMemo(() => new Date(quarterStart), [quarterStart]);
    const qEnd = useMemo(() => new Date(quarterEnd), [quarterEnd]);
    const totalMs = qEnd.getTime() - qStart.getTime();

    // Months in quarter
    const months = useMemo(() => {
        const startMonth = (quarter - 1) * 3;
        return [0, 1, 2].map((offset) => {
            const date = new Date(year, startMonth + offset, 1);
            return {
                name: date.toLocaleString('default', { month: 'long' }),
                short: date.toLocaleString('default', { month: 'short' }),
                days: new Date(year, startMonth + offset + 1, 0).getDate(),
            };
        });
    }, [quarter, year]);

    // Position calculator (% from left: 0% to 100%)
    const getPosition = (dateStr: string) => {
        if (!dateStr || totalMs <= 0) return 0;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 0;
        const clamped = Math.max(qStart.getTime(), Math.min(qEnd.getTime(), d.getTime()));
        return Math.max(0, Math.min(100, ((clamped - qStart.getTime()) / totalMs) * 100));
    };

    const todayPos = useMemo(() => {
        if (totalMs <= 0) return null;
        const now = new Date();
        if (now < qStart || now > qEnd) return null;
        return ((now.getTime() - qStart.getTime()) / totalMs) * 100;
    }, [qStart, qEnd, totalMs]);

    const filteredRequests = useMemo(() => {
        if (selectedProject === 'all') return requests;
        return requests.filter((r) => r.project?.id === selectedProject);
    }, [requests, selectedProject]);

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] shadow-2xl overflow-hidden select-none">
            {/* Filter & Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-4 bg-[#0e0f16]/60">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">Project:</span>
                    <select
                        value={selectedProject}
                        onChange={(e) =>
                            setSelectedProject(
                                e.target.value === 'all' ? 'all' : Number(e.target.value)
                            )
                        }
                        className="rounded-lg border border-zinc-800 bg-[#07090e] px-2.5 py-1 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none"
                    >
                        <option value="all">All Projects ({projects.length})</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-violet-500" />
                        <span>Task</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Done</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span>Blocked</span>
                    </div>
                </div>
            </div>

            {/* Gantt Timeline Viewport */}
            <div className="overflow-x-auto">
                <div className="min-w-[950px]">
                    {/* Header: Months & Calendar Days */}
                    <div className="flex border-b border-white/[0.06] bg-[#090a0f] text-xs font-semibold text-zinc-400 sticky top-0 z-10">
                        <div className="w-80 shrink-0 border-r border-white/[0.06] p-3 text-zinc-300">
                            Project / Task
                        </div>
                        <div className="flex-1 grid grid-cols-3 divide-x divide-white/[0.06]">
                            {months.map((m) => (
                                <div key={m.name} className="p-3 text-center">
                                    <span className="text-zinc-200">{m.name}</span>
                                    <span className="ml-1 text-[11px] text-zinc-500">
                                        ({m.days}d)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Body Rows */}
                    <div className="relative divide-y divide-white/[0.04]">
                        {/* Today Marker Line */}
                        {todayPos !== null && (
                            <div
                                className="absolute top-0 bottom-0 z-20 pointer-events-none"
                                style={{ left: `calc(320px + (100% - 320px) * ${todayPos / 100})` }}
                            >
                                <div className="h-full w-px bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
                                <span className="absolute -top-2.5 -translate-x-1/2 rounded bg-pink-500 px-1 py-0.2 text-[9px] font-bold text-white uppercase tracking-wider">
                                    Today
                                </span>
                            </div>
                        )}

                        {/* Projects / Initiatives Summary Section */}
                        {projects.map((proj) => {
                            const left = getPosition(proj.start_date);
                            const right = getPosition(proj.due_date);
                            const width = Math.max(right - left, 6);

                            return (
                                <div
                                    key={`proj-${proj.id}`}
                                    className="flex items-center hover:bg-white/[0.015] transition-colors"
                                >
                                    {/* Project Info Column */}
                                    <div className="w-80 shrink-0 border-r border-white/[0.06] p-3 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: proj.color }}
                                            />
                                            <span className="truncate text-xs font-bold text-white">
                                                {proj.name}
                                            </span>
                                        </div>
                                        <span className="font-mono text-[11px] text-zinc-400 shrink-0">
                                            {proj.completed_requests}/{proj.total_requests} completed
                                        </span>
                                    </div>

                                    {/* Project Gantt Bar Track */}
                                    <div className="flex-1 relative h-10 flex items-center px-2">
                                        <div
                                            className="absolute h-5 rounded-lg border flex items-center px-2 text-[10px] font-bold text-white shadow-md transition-all overflow-hidden"
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                backgroundColor: `${proj.color}25`,
                                                borderColor: proj.color,
                                            }}
                                            title={`${proj.name}: ${proj.completion_percentage}% complete`}
                                        >
                                            <div
                                                className="absolute left-0 top-0 bottom-0 opacity-40"
                                                style={{
                                                    width: `${proj.completion_percentage}%`,
                                                    backgroundColor: proj.color,
                                                }}
                                            />
                                            <span className="relative z-10 truncate font-mono">
                                                {proj.name} · {proj.completion_percentage}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Work Requests Rows */}
                        {filteredRequests.map((req) => {
                            const left = getPosition(req.start_date);
                            const right = getPosition(req.due_date);
                            const width = Math.max(right - left, 5);
                            const isDone = req.status === 'done';

                            return (
                                <div
                                    key={`req-${req.id}`}
                                    className="flex items-center hover:bg-white/[0.02] transition-colors group"
                                >
                                    {/* Ticket Info Column */}
                                    <div className="w-80 shrink-0 border-r border-white/[0.06] p-2.5 pl-6 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-mono text-[11px] text-zinc-500 group-hover:text-violet-300 shrink-0">
                                                #{req.id}
                                            </span>
                                            <Link
                                                href={route('requests.show', req.id)}
                                                className={`truncate text-xs font-medium hover:underline ${
                                                    isDone
                                                        ? 'line-through text-zinc-500'
                                                        : 'text-zinc-200 hover:text-white'
                                                }`}
                                            >
                                                {req.title}
                                            </Link>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {req.story_points !== null && (
                                                <span className="rounded border border-violet-500/30 bg-violet-500/10 px-1 py-0.2 font-mono text-[9px] text-violet-300">
                                                    {req.story_points}p
                                                </span>
                                            )}
                                            {req.is_blocked && (
                                                <AlertTriangle className="h-3 w-3 text-rose-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Gantt Bar Track */}
                                    <div className="flex-1 relative h-9 flex items-center px-2">
                                        <Link
                                            href={route('requests.show', req.id)}
                                            className={`absolute h-4 rounded-md border flex items-center px-1.5 text-[9px] font-medium shadow-sm transition-all group-hover:ring-1 group-hover:ring-white/20 truncate ${
                                                isDone
                                                    ? 'border-emerald-600/60 bg-emerald-950/40 text-emerald-200'
                                                    : req.is_blocked
                                                    ? 'border-rose-500/80 bg-rose-950/40 text-rose-200'
                                                    : 'border-violet-500/60 bg-violet-950/40 text-violet-200'
                                            }`}
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`,
                                            }}
                                            title={`#${req.id} ${req.title} (${req.status_label})`}
                                        >
                                            <span className="truncate">{req.title}</span>
                                        </Link>

                                        {/* Blocking Dependency Connection Indicator */}
                                        {req.blocking_ids.length > 0 && (
                                            <span
                                                className="absolute text-[8px] font-mono text-amber-400 font-bold"
                                                style={{ left: `${left + width + 1}%` }}
                                                title={`Blocks: ${req.blocking_ids.map((id) => `#${id}`).join(', ')}`}
                                            >
                                                ↳ Blocks {req.blocking_ids.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
