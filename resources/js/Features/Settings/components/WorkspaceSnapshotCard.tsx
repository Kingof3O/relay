import { WorkspaceProject, WorkspaceUser } from '@/types/workspace';
import {
    Sparkles,
    FolderKanban,
    Users,
    Activity,
    ShieldCheck,
    Cpu,
    ArrowRight,
    ArrowUpRight,
    Layers,
    CheckCircle2,
    Clock,
    Shield,
} from 'lucide-react';

export interface WorkspaceAuditFeedItem {
    id: number;
    user?: {
        id: number;
        name: string;
        username: string;
    } | null;
    event: string;
    auditable_type?: string | null;
    auditable_id?: number | null;
    old_values?: Record<string, any> | null;
    new_values?: Record<string, any> | null;
    ip_address?: string | null;
    created_at?: string | null;
}

export interface WorkspaceSnapshotCardProps {
    activeProjectsCount: number;
    teamAccountsCount: number;
    projects?: WorkspaceProject[];
    users?: WorkspaceUser[];
    audits?: WorkspaceAuditFeedItem[];
    onSelectTab?: (tab: 'projects' | 'team') => void;
}

export default function WorkspaceSnapshotCard({
    activeProjectsCount,
    teamAccountsCount,
    projects = [],
    users = [],
    audits = [],
    onSelectTab,
}: WorkspaceSnapshotCardProps) {
    const totalActiveRequests = projects.reduce(
        (sum, p) => sum + (p.active_count ?? 0),
        0
    );
    const archivedProjectsCount = projects.filter((p) => Boolean(p.archived_at)).length;
    const activeUsersCount = users.filter((u) => u.active !== false).length;
    const inactiveUsersCount = users.filter((u) => u.active === false).length;

    const adminsCount = users.filter((u) => {
        const name = (u.role?.name ?? '').toLowerCase();
        return name.includes('owner') || name.includes('admin');
    }).length;

    const devsCount = users.filter((u) => {
        const name = (u.role?.name ?? '').toLowerCase();
        return name.includes('dev') || name.includes('engineer');
    }).length;

    const designersCount = users.filter((u) => {
        const name = (u.role?.name ?? '').toLowerCase();
        return name.includes('design') || name.includes('ui') || name.includes('ux');
    }).length;

    const stakeholdersCount = users.filter((u) => {
        const name = (u.role?.name ?? '').toLowerCase();
        return !name.includes('owner') && !name.includes('admin') && !name.includes('dev') && !name.includes('engineer') && !name.includes('design') && !name.includes('ui') && !name.includes('ux');
    }).length;

    return (
        <div className="space-y-6">
            {/* 1. 4 Full-Width KPI Metric Tiles Matching DashboardKpiTiles */}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {/* Tile 1: Active Initiatives */}
                <div
                    onClick={() => onSelectTab?.('projects')}
                    className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c] cursor-pointer"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-violet-400">
                            <FolderKanban className="h-4 w-4" />
                        </div>
                        {onSelectTab && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
                                Manage <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        )}
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-medium text-zinc-400">
                            Active initiatives
                        </p>
                        <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                            {activeProjectsCount}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                            {archivedProjectsCount > 0
                                ? `${archivedProjectsCount} archived boards preserved`
                                : 'All project boards active'}
                        </p>
                    </div>
                    {projects.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 overflow-hidden pt-2 border-t border-zinc-800/60">
                            {projects.slice(0, 6).map((p) => (
                                <span
                                    key={p.id}
                                    title={p.name}
                                    className="h-2 w-2 rounded-full ring-1 ring-white/10"
                                    style={{ backgroundColor: p.color || '#8B5CF6' }}
                                />
                            ))}
                            {projects.length > 6 && (
                                <span className="font-mono text-[10px] text-zinc-500">
                                    +{projects.length - 6}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Tile 2: Team Accounts */}
                <div
                    onClick={() => onSelectTab?.('team')}
                    className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c] cursor-pointer"
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-cyan-400">
                            <Users className="h-4 w-4" />
                        </div>
                        {onSelectTab && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-zinc-300">
                                Team Roster <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        )}
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-medium text-zinc-400">
                            Team roster
                        </p>
                        <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                            {teamAccountsCount || '—'}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                            {activeUsersCount} active · {inactiveUsersCount} paused
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium pt-2 border-t border-zinc-800/60">
                        <span className="rounded bg-violet-500/15 px-1.5 py-0.5 text-violet-300 font-mono">
                            {adminsCount} Admin
                        </span>
                        <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-cyan-300 font-mono">
                            {devsCount} Dev
                        </span>
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300 font-mono">
                            {designersCount} Design
                        </span>
                    </div>
                </div>

                {/* Tile 3: Open Workload */}
                <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-emerald-400">
                            <Activity className="h-4 w-4" />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Live Telemetry
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-medium text-zinc-400">
                            Active workload
                        </p>
                        <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                            {totalActiveRequests}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                            {activeProjectsCount > 0
                                ? `~${(totalActiveRequests / Math.max(1, activeProjectsCount)).toFixed(1)} requests / initiative`
                                : 'No open requests'}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>All priority queues operational</span>
                    </div>
                </div>

                {/* Tile 4: Studio Engine & RBAC */}
                <div className="group relative flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#111216] p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-[#14161c]">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-amber-400">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <span className="rounded border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                            RBAC Active
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-medium text-zinc-400">
                            Studio engine
                        </p>
                        <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                            Relay v2.4
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-500">
                            Dual S3 / WebP Transcoder
                        </p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-zinc-400 pt-2 border-t border-zinc-800/60">
                        <Cpu className="h-3 w-3 text-cyan-400" />
                        <span>Transactional Email Engine Active</span>
                    </div>
                </div>
            </section>

            {/* 2. Visual Obsidian Hero Mission Control Banner */}
            <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm sm:p-7">
                {/* Specular Ambient Glows */}
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-cyan-600/10 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div className="max-w-2xl space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-300">
                            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
                            <span>Workspace Operations & Intelligence</span>
                            <span className="h-1 w-1 rounded-full bg-zinc-500" />
                            <span className="text-zinc-400">{projects.length} Total Initiatives</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Projects, People, and Delivery Telemetry.
                        </h2>
                        <p className="text-xs leading-relaxed text-zinc-400 sm:text-sm">
                            Expansive operational command for Relay Studio. Monitor project scopes, member access privileges, active throughput, and system deployment status in real time.
                        </p>
                    </div>

                    {onSelectTab && (
                        <div className="flex shrink-0 flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onSelectTab('projects')}
                                className="group flex items-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-850 px-4 py-2.5 text-xs font-medium text-zinc-200 shadow-sm transition-all duration-150 hover:border-zinc-600 hover:bg-zinc-800 hover:text-white active:scale-[0.98]"
                            >
                                <FolderKanban className="h-4 w-4 text-violet-400 transition-transform group-hover:scale-110" />
                                <span>Manage Projects</span>
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onSelectTab('team')}
                                className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:bg-zinc-200 active:scale-[0.98]"
                            >
                                <Users className="h-4 w-4 text-zinc-950 transition-transform group-hover:scale-110" />
                                <span>Team Roster</span>
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Deep Workspace Details Grid */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Active Projects Roster & Capacity */}
                <div className="rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-violet-400">
                                <Layers className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-100">
                                    Initiative Distribution & Workload
                                </h3>
                                <p className="text-[11px] text-zinc-400">
                                    Real-time request capacity across active project workspaces.
                                </p>
                            </div>
                        </div>
                        <span className="font-mono text-xs text-zinc-400">
                            {projects.length} Total
                        </span>
                    </div>

                    <div className="mt-4 divide-y divide-zinc-800/60">
                        {projects.length === 0 ? (
                            <p className="py-6 text-center text-xs text-zinc-500">No projects configured.</p>
                        ) : (
                            projects.slice(0, 6).map((project) => {
                                const activeCount = project.active_count ?? 0;
                                const workloadPercent = totalActiveRequests > 0
                                    ? Math.round((activeCount / totalActiveRequests) * 100)
                                    : 0;

                                return (
                                    <div key={project.id} className="py-3 text-xs first:pt-1 last:pb-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                                                    style={{ backgroundColor: project.color || '#8B5CF6' }}
                                                />
                                                <span className="font-medium text-zinc-200 truncate">
                                                    {project.name}
                                                </span>
                                                {project.slug && (
                                                    <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">
                                                        /{project.slug}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="rounded border border-zinc-800 bg-[#0c0d12] px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">
                                                    {activeCount} active
                                                </span>
                                                {project.archived_at && (
                                                    <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-400">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Capacity Bar */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                                                <div
                                                    className="h-full rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${Math.max(4, workloadPercent)}%`,
                                                        backgroundColor: project.color || '#8B5CF6',
                                                    }}
                                                />
                                            </div>
                                            <span className="font-mono text-[10px] text-zinc-500 shrink-0 w-8 text-right">
                                                {workloadPercent}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Security & Access Policies */}
                <div className="rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-cyan-400">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-100">
                                    Access & Permissions Matrix
                                </h3>
                                <p className="text-[11px] text-zinc-400">
                                    Role-Based Access Control (RBAC) privilege policies.
                                </p>
                            </div>
                        </div>
                        <span className="font-mono text-xs text-emerald-400">
                            Enforced
                        </span>
                    </div>

                    <div className="mt-4 space-y-3 text-xs">
                        {/* Admin Policy */}
                        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-200">Admins & Owners</span>
                                        <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] text-violet-300">
                                            {adminsCount} Assigned
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-zinc-400 truncate">
                                        Full studio control, team rosters, and initiative creation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Developer Policy */}
                        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-200">Developers</span>
                                        <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">
                                            {devsCount} Assigned
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-zinc-400 truncate">
                                        Code delivery, queue triage, status transitions & attachments.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Designer Policy */}
                        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-200">Designers</span>
                                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                                            {designersCount} Assigned
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-zinc-400 truncate">
                                        UI/UX feedback, design reviews, asset uploads & visual approvals.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stakeholder Policy */}
                        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#0c0d12] p-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-200">Stakeholders</span>
                                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] text-amber-300">
                                            {stakeholdersCount} Assigned
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-zinc-400 truncate">
                                        Request submission, status viewing, commenting & progress monitoring.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Enterprise Audit Log & Governance Activity Feed */}
            <section className="rounded-xl border border-zinc-800 bg-[#111216] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-amber-400">
                            <Shield className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-100">
                                Workspace Audit Log & Governance Activity
                            </h3>
                            <p className="text-[11px] text-zinc-400">
                                Chronological feed of administrative, permission, and project changes.
                            </p>
                        </div>
                    </div>
                    <span className="font-mono text-xs text-zinc-400">
                        {audits.length} Recent Events
                    </span>
                </div>

                <div className="mt-4">
                    {audits.length === 0 ? (
                        <div className="py-8 text-center">
                            <Clock className="mx-auto h-6 w-6 text-zinc-600" />
                            <p className="mt-2 text-xs text-zinc-500">No governance audit events recorded yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800/60">
                            {audits.map((audit) => {
                                const tagConfig = getActionTagConfig(audit.event);
                                const actorName = audit.user?.name || 'System Actor';
                                const formattedDate = audit.created_at
                                    ? new Date(audit.created_at).toLocaleString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                      })
                                    : 'Recent';

                                return (
                                    <div
                                        key={audit.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 text-xs first:pt-1 last:pb-1"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span
                                                className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider shrink-0 ${tagConfig.badgeClass}`}
                                            >
                                                {tagConfig.label}
                                            </span>
                                            <div className="min-w-0 truncate">
                                                <span className="font-medium text-zinc-200">
                                                    {actorName}
                                                </span>
                                                <span className="text-zinc-500 mx-1.5">·</span>
                                                <span className="text-zinc-400 truncate">
                                                    {tagConfig.description(audit)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-zinc-500 pl-8 sm:pl-0">
                                            {audit.ip_address && (
                                                <span className="hidden md:inline text-zinc-600">
                                                    {audit.ip_address}
                                                </span>
                                            )}
                                            <span>{formattedDate}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function getActionTagConfig(event: string) {
    switch (event) {
        case 'member.role_updated':
            return {
                label: 'Role Updated',
                badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
                description: (a: WorkspaceAuditFeedItem) => {
                    const targetName = a.new_values?.name || `User #${a.auditable_id}`;
                    return `Updated access role for ${targetName}`;
                },
            };
        case 'member.invited':
            return {
                label: 'Member Added',
                badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
                description: (a: WorkspaceAuditFeedItem) => {
                    const name = a.new_values?.name || `User #${a.auditable_id}`;
                    return `Invited new team member: ${name}`;
                },
            };
        case 'member.removed':
            return {
                label: 'Member Removed',
                badgeClass: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
                description: (a: WorkspaceAuditFeedItem) => {
                    const name = a.old_values?.name || `User #${a.auditable_id}`;
                    return `Removed member account: ${name}`;
                },
            };
        case 'project.created':
            return {
                label: 'Project Created',
                badgeClass: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
                description: (a: WorkspaceAuditFeedItem) => {
                    const name = a.new_values?.name || `Project #${a.auditable_id}`;
                    return `Created initiative workspace: ${name}`;
                },
            };
        case 'project.archived':
            return {
                label: 'Project Archived',
                badgeClass: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
                description: (a: WorkspaceAuditFeedItem) => {
                    return `Archived project initiative #${a.auditable_id}`;
                },
            };
        default:
            return {
                label: event.replace(/[._]/g, ' '),
                badgeClass: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
                description: (a: WorkspaceAuditFeedItem) => `Executed ${event} on ${a.auditable_type || 'entity'} #${a.auditable_id || ''}`,
            };
    }
}

