import { getAvatarPalette, getRoleBadgeStyle } from '@/Features/Settings/components/TeamManagementCard';
import { usePage } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    CheckCircle2,
    Layers,
    Mail,
    Shield,
    Sparkles,
    TrendingUp,
} from 'lucide-react';

export interface VisualIdentityHeroProps {
    stats?: {
        assigned_count: number;
        completed_count: number;
    };
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function formatJoined(dateStr?: string | null): string {
    if (!dateStr) return 'Active Contributor';
    try {
        const d = new Date(dateStr);
        return `Joined ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } catch {
        return 'Active Contributor';
    }
}

export default function VisualIdentityHero({ stats }: VisualIdentityHeroProps) {
    const user = usePage().props.auth.user;
    const role = usePage().props.auth.role;

    const assignedCount = stats?.assigned_count ?? 0;
    const completedCount = stats?.completed_count ?? 0;
    const activeCount = Math.max(0, assignedCount - completedCount);
    const completionRate =
        assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 100;

    const avatar = getAvatarPalette(user.username || user.name);
    const roleBadge = getRoleBadgeStyle(role?.name || user.role?.name);
    const joinedText = formatJoined(user.created_at);

    return (
        <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm sm:p-7">
            {/* Ambient specular highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/[0.05] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-16 h-72 w-72 rounded-full bg-indigo-600/[0.04] blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
                {/* Avatar & Identification */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative shrink-0">
                        <div
                            className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border bg-gradient-to-br ${avatar.bg} ${avatar.border} ${avatar.text} text-2xl sm:text-3xl font-extrabold shadow-xl ring-2 ring-white/[0.06]`}
                        >
                            {getInitials(user.name)}
                        </div>
                        <span
                            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-[#0c0d12] shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                            title="Active Session"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                {user.name}
                            </h2>
                            <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-300">
                                @{user.username}
                            </span>
                        </div>

                        {user.email && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                <Mail className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{user.email}</span>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleBadge.pillClass}`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${roleBadge.dotClass}`} />
                                {roleBadge.label}
                            </span>

                            <span className="text-zinc-600">·</span>

                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                                <span>{joinedText}</span>
                            </div>

                            <span className="text-zinc-600">·</span>

                            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                <Sparkles className="h-3 w-3" />
                                <span>Team Member</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Work Stats Row & Completion Progress Bar */}
                <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-[#121318]/90 p-4 sm:p-5 shadow-inner xl:min-w-[440px]">
                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-3">
                        {/* Assigned */}
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                <Activity className="h-3 w-3 text-violet-400" />
                                <span>Assigned</span>
                            </div>
                            <p className="text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight text-white">
                                {assignedCount}
                            </p>
                            <p className="text-[10px] text-zinc-500">{activeCount} in progress</p>
                        </div>

                        {/* Completed */}
                        <div className="space-y-0.5 border-x border-zinc-800/80 px-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span>Completed</span>
                            </div>
                            <p className="text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight text-emerald-300">
                                {completedCount}
                            </p>
                            <p className="text-[10px] text-zinc-500">Tasks done</p>
                        </div>

                        {/* Completion Rate */}
                        <div className="space-y-0.5 pl-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                                <TrendingUp className="h-3 w-3 text-violet-400" />
                                <span>Completion</span>
                            </div>
                            <p className="text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight text-violet-300">
                                {completionRate}%
                            </p>
                            <p className="text-[10px] text-zinc-500">Rate</p>
                        </div>
                    </div>

                    {/* Completion Rate Progress Bar */}
                    <div className="space-y-1.5 border-t border-zinc-800/80 pt-3">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-zinc-400 flex items-center gap-1.5">
                                <Layers className="h-3 w-3 text-zinc-500" />
                                <span>Completion Rate</span>
                            </span>
                            <span className="font-mono text-xs font-semibold text-zinc-300">
                                {completedCount}/{assignedCount} completed ({completionRate}%)
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 p-0.5 border border-zinc-750">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                                style={{ width: `${Math.min(100, Math.max(completionRate, 4))}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
