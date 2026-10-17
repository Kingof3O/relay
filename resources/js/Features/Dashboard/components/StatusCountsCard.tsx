import { useState } from 'react';
import Card from '@/Components/Card';
import { statusMeta } from '@/Utils/status';
import { PieChart, FileText } from 'lucide-react';

export type StatusCount = {
    status: string;
    count: number;
};

export default function StatusCountsCard({
    items,
}: {
    items: StatusCount[];
}) {
    const [hovered, setHovered] = useState<string | null>(null);

    const total = items.reduce((sum, item) => sum + item.count, 0);
    const radius = 38;
    const circumference = 2 * Math.PI * radius;

    // Donut segments are drawn as dash offsets, walking clockwise from 12 o'clock.
    let cumulative = 0;
    const segments = items.map((item) => {
        const fraction = total > 0 ? item.count / total : 0;
        const segment = {
            ...item,
            dashLength: fraction * circumference,
            dashOffset: circumference * (1 - cumulative),
            percent: Math.round(fraction * 100),
        };
        cumulative += fraction;
        return segment;
    });

    const hoveredItem = items.find((item) => item.status === hovered) ?? null;

    return (
        <Card className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Idea Statuses
                    </h3>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                        Distribution across lifecycle stages
                    </p>
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-violet-300">
                    <PieChart className="h-3.5 w-3.5" />
                </div>
            </div>

            {total === 0 ? (
                <EmptyState label="No ideas recorded yet" />
            ) : (
                <div className="mt-5 flex flex-1 flex-col items-center justify-around gap-6 md:flex-row">
                    <div className="relative h-44 w-44 flex-shrink-0">
                        <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_15px_rgba(139,92,246,0.15)]" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                className="stroke-white/[0.06]"
                                strokeWidth="9"
                                fill="transparent"
                            />
                            {segments.map((segment) => {
                                const meta = statusMeta(segment.status);
                                const dimmed = hovered !== null && hovered !== segment.status;

                                return (
                                    <circle
                                        key={segment.status}
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        stroke={meta.hex}
                                        strokeWidth={hovered === segment.status ? 11 : 9}
                                        strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
                                        strokeDashoffset={segment.dashOffset}
                                        strokeLinecap="butt"
                                        fill="transparent"
                                        className="cursor-pointer transition-all duration-200"
                                        style={{ opacity: dimmed ? 0.25 : 1 }}
                                        onMouseEnter={() => setHovered(segment.status)}
                                        onMouseLeave={() => setHovered(null)}
                                    />
                                );
                            })}
                        </svg>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                            {hoveredItem ? (
                                <>
                                    <span className="text-3xl font-extrabold tabular-nums text-white">
                                        {hoveredItem.count}
                                    </span>
                                    <span className="mt-0.5 max-w-[90px] text-[10px] font-bold leading-tight text-violet-300">
                                        {statusMeta(hoveredItem.status).label}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-3xl font-extrabold tabular-nums text-white">
                                        {total}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                        Total Ideas
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex-1 space-y-1">
                        {segments.map((segment) => {
                            const meta = statusMeta(segment.status);
                            const active = hovered === segment.status;

                            return (
                                <div
                                    key={segment.status}
                                    onMouseEnter={() => setHovered(segment.status)}
                                    onMouseLeave={() => setHovered(null)}
                                    className={`flex cursor-default items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 transition-all duration-150 ${
                                        active
                                            ? 'border-white/[0.12] bg-[#07090e] shadow-specular'
                                            : 'hover:border-white/[0.06] hover:bg-white/[0.02]'
                                    }`}
                                >
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span
                                            className="h-2 w-2 flex-shrink-0 rounded-full shadow-[0_0_6px_currentColor]"
                                            style={{ backgroundColor: meta.hex, color: meta.hex }}
                                        />
                                        <span className="truncate text-xs font-semibold text-zinc-200">
                                            {meta.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 tabular-nums">
                                        <span className="text-xs text-zinc-400">
                                            {segment.percent}%
                                        </span>
                                        <span className="w-8 text-right text-xs font-bold text-white">
                                            {segment.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card>
    );
}

export function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-zinc-500">
            <FileText className="h-7 w-7 text-zinc-600 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    );
}

