import React, { useMemo, useState } from 'react';

interface DayPoint {
    day: number;
    date: string;
    label: string;
    ideal: number;
    actual: number | null;
    is_today: boolean;
    is_future: boolean;
}

interface BurndownData {
    cycle: {
        id: number;
        number: number;
        name: string;
        start_date: string;
        end_date: string;
        is_active: boolean;
    };
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
    days: DayPoint[];
}

export default function CycleBurndownChart({ data }: { data: BurndownData }) {
    const { days, metrics } = data;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const width = 800;
    const height = 260;
    const padding = { top: 25, right: 35, bottom: 35, left: 45 };

    const maxPoints = Math.max(metrics.total_points, 10);
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const xStep = days.length > 1 ? chartWidth / (days.length - 1) : chartWidth;

    const getY = (val: number) => {
        return padding.top + chartHeight - (val / maxPoints) * chartHeight;
    };

    const getX = (index: number) => {
        return padding.left + index * xStep;
    };

    // Build Ideal Line Path
    const idealPath = useMemo(() => {
        if (!days.length) return '';
        return days.reduce((path, d, i) => {
            const x = getX(i);
            const y = getY(d.ideal);
            return i === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
        }, '');
    }, [days, maxPoints]);

    // Build Actual Line Path & Area
    const { actualPath, actualAreaPath } = useMemo(() => {
        const recordedDays = days.filter((d) => d.actual !== null);
        if (!recordedDays.length) return { actualPath: '', actualAreaPath: '' };

        const points = recordedDays.map((d) => {
            const index = days.findIndex((day) => day.date === d.date);
            return {
                x: getX(index),
                y: getY(d.actual as number),
            };
        });

        const line = points.reduce((path, p, i) => {
            return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
        }, '');

        const first = points[0];
        const last = points[points.length - 1];
        const bottomY = padding.top + chartHeight;
        const area = `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;

        return { actualPath: line, actualAreaPath: area };
    }, [days, maxPoints]);

    return (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d12] p-5 shadow-xl">
            {/* Chart Header & Metrics Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Cycle Burndown Velocity</span>
                        <span className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-mono text-violet-300">
                            {metrics.completed_points} / {metrics.total_points} pts ({metrics.completion_percentage}%)
                        </span>
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-400">
                        Linear burn trajectory vs actual completed points per day
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-5 rounded-full border border-dashed border-zinc-500" />
                        <span className="text-zinc-400">Ideal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-5 rounded-full bg-violet-500" />
                        <span className="text-zinc-300 font-medium">Actual</span>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-[#14151b] px-2.5 py-1 text-zinc-300 font-mono text-[11px]">
                        Velocity: <span className="text-emerald-400 font-semibold">{metrics.velocity_points_per_day} pts/day</span>
                    </div>
                </div>
            </div>

            {/* SVG Burndown Plot */}
            <div className="relative mt-4 w-full overflow-x-auto select-none">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto overflow-visible font-mono text-[10px]"
                >
                    <defs>
                        <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                        const y = padding.top + chartHeight * (1 - pct);
                        const val = Math.round(maxPoints * pct);
                        return (
                            <g key={pct}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={width - padding.right}
                                    y2={y}
                                    stroke="currentColor"
                                    className="text-zinc-850"
                                    strokeDasharray={pct === 0 ? undefined : '3 3'}
                                />
                                <text
                                    x={padding.left - 8}
                                    y={y + 3}
                                    textAnchor="end"
                                    className="fill-zinc-500 font-mono text-[9px]"
                                >
                                    {val}
                                </text>
                            </g>
                        );
                    })}

                    {/* Today Vertical Line Indicator */}
                    {days.map((d, i) => {
                        if (!d.is_today) return null;
                        const x = getX(i);
                        return (
                            <g key="today-indicator">
                                <line
                                    x1={x}
                                    y1={padding.top}
                                    x2={x}
                                    y2={padding.top + chartHeight}
                                    stroke="#ec4899"
                                    strokeWidth="1.5"
                                    strokeDasharray="4 3"
                                />
                                <text
                                    x={x}
                                    y={padding.top - 8}
                                    textAnchor="middle"
                                    className="fill-pink-400 font-bold text-[9px]"
                                >
                                    TODAY
                                </text>
                            </g>
                        );
                    })}

                    {/* Ideal Line (Dashed) */}
                    <path
                        d={idealPath}
                        fill="none"
                        stroke="#71717a"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                    />

                    {/* Actual Gradient Fill Area */}
                    {actualAreaPath && (
                        <path d={actualAreaPath} fill="url(#actualGradient)" />
                    )}

                    {/* Actual Line (Solid Vibrant) */}
                    {actualPath && (
                        <path
                            d={actualPath}
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Interactive Data Point Dots */}
                    {days.map((d, i) => {
                        const x = getX(i);
                        const isRecorded = d.actual !== null;
                        const y = isRecorded ? getY(d.actual as number) : getY(d.ideal);

                        return (
                            <g
                                key={d.date}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="cursor-pointer"
                            >
                                {/* Invisible touch/hover area */}
                                <rect
                                    x={x - xStep / 2}
                                    y={padding.top}
                                    width={xStep}
                                    height={chartHeight}
                                    fill="transparent"
                                />

                                {isRecorded && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={hoveredIndex === i ? 5 : 3.5}
                                        fill="#8b5cf6"
                                        stroke="#0c0d12"
                                        strokeWidth="2"
                                        className="transition-all"
                                    />
                                )}

                                {/* X-Axis Date Labels */}
                                {(i === 0 || i === days.length - 1 || i % 2 === 0) && (
                                    <text
                                        x={x}
                                        y={padding.top + chartHeight + 18}
                                        textAnchor="middle"
                                        className={`text-[9px] font-mono ${
                                            d.is_today
                                                ? 'fill-pink-400 font-bold'
                                                : 'fill-zinc-500'
                                        }`}
                                    >
                                        {d.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Hover Tooltip Card */}
                {hoveredIndex !== null && days[hoveredIndex] && (
                    <div
                        className="pointer-events-none absolute top-2 rounded-xl border border-zinc-700 bg-zinc-900/95 px-3 py-2 text-xs shadow-2xl backdrop-blur"
                        style={{
                            left: `${Math.min(
                                Math.max((hoveredIndex / (days.length - 1)) * 100, 10),
                                85
                            )}%`,
                        }}
                    >
                        <div className="font-semibold text-white">
                            Day {days[hoveredIndex].day} · {days[hoveredIndex].label}
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-mono">
                            <span className="text-zinc-400">Ideal remaining:</span>
                            <span className="text-zinc-300 font-bold">
                                {days[hoveredIndex].ideal} pts
                            </span>
                        </div>
                        {days[hoveredIndex].actual !== null && (
                            <div className="flex items-center justify-between gap-3 text-[11px] font-mono">
                                <span className="text-violet-400">Actual remaining:</span>
                                <span className="text-violet-300 font-bold">
                                    {days[hoveredIndex].actual} pts
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
