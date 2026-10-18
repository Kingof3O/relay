import Card from '@/Components/Card';
import { BarChart3 } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { VelocityPoint } from '../types';

interface DeliveryVelocityCardProps {
    velocity?: VelocityPoint[];
    className?: string;
}

interface VelocityTooltipPayload {
    dataKey?: string | number;
    value?: number;
}

interface VelocityTooltipProps {
    active?: boolean;
    payload?: VelocityTooltipPayload[];
    label?: string;
}

export function VelocityTooltip({ active, payload, label }: VelocityTooltipProps) {
    if (!active || !payload || !payload.length) return null;
    const created = payload.find((p) => p.dataKey === 'created')?.value ?? 0;
    const completed = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;

    return (
        <div className="rounded-lg border border-zinc-800 bg-[#0c0d11]/95 p-3 shadow-xl backdrop-blur-md">
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">{label}</p>
            <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between gap-5 text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                        Created
                    </span>
                    <span className="font-semibold tabular-nums text-zinc-100">{created}</span>
                </div>
                <div className="flex items-center justify-between gap-5 text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Completed
                    </span>
                    <span className="font-semibold tabular-nums text-zinc-100">{completed}</span>
                </div>
            </div>
        </div>
    );
}

export default function DeliveryVelocityCard({
    velocity = [],
    className = 'p-5 lg:col-span-7',
}: DeliveryVelocityCardProps) {
    return (
        <Card className={className} hoverable>
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">Weekly Activity</h3>
                        <p className="text-xs text-zinc-500">
                            Tasks created vs completed this week
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-400" />
                        <span className="text-zinc-400">Created</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-zinc-400">Completed</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 h-64 w-full">
                {velocity.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={velocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.08} />
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke="#71717a"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#71717a"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip content={<VelocityTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="created"
                                stroke="#818cf8"
                                strokeWidth={1.5}
                                fillOpacity={1}
                                fill="url(#createdGrad)"
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                stroke="#34d399"
                                strokeWidth={1.5}
                                fillOpacity={1}
                                fill="url(#completedGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                        Insufficient data points for velocity curve.
                    </div>
                )}
            </div>
        </Card>
    );
}
