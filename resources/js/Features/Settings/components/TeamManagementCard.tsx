import { WorkspaceUser } from '@/types/workspace';
import axios, { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import {
    Users,
    UserPlus,
    AlertCircle,
    Search,
    X,
    KeyRound,
    Edit3,
    Mail,
    CheckCircle2,
    Shield,
    Sparkles,
} from 'lucide-react';

export interface TeamManagementCardProps {
    users: WorkspaceUser[];
    setUsers: React.Dispatch<React.SetStateAction<WorkspaceUser[]>>;
    onAddMember: () => void;
    onEditMember: (user: WorkspaceUser) => void;
}

export interface AvatarPalette {
    bg: string;
    border: string;
    text: string;
}

export const AVATAR_PALETTES: AvatarPalette[] = [
    {
        bg: 'from-violet-950/70 via-[#13141f] to-[#0c0d12]',
        border: 'border-violet-500/30',
        text: 'text-violet-200',
    },
    {
        bg: 'from-sky-950/70 via-[#101522] to-[#0c0d12]',
        border: 'border-sky-500/30',
        text: 'text-sky-200',
    },
    {
        bg: 'from-emerald-950/70 via-[#101c18] to-[#0c0d12]',
        border: 'border-emerald-500/30',
        text: 'text-emerald-200',
    },
    {
        bg: 'from-indigo-950/70 via-[#121422] to-[#0c0d12]',
        border: 'border-indigo-500/30',
        text: 'text-indigo-200',
    },
    {
        bg: 'from-amber-950/70 via-[#1a1712] to-[#0c0d12]',
        border: 'border-amber-500/30',
        text: 'text-amber-200',
    },
    {
        bg: 'from-rose-950/70 via-[#1a1215] to-[#0c0d12]',
        border: 'border-rose-500/30',
        text: 'text-rose-200',
    },
    {
        bg: 'from-zinc-850 via-[#14151b] to-[#0c0d12]',
        border: 'border-zinc-700',
        text: 'text-zinc-200',
    },
];

export function getAvatarPalette(key: string): AvatarPalette {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
}

export function getAvatarGradient(key: string): string {
    const p = getAvatarPalette(key);
    return `${p.bg} ${p.border} ${p.text}`;
}

export function getRoleBadgeStyle(roleName?: string | null): {
    label: string;
    pillClass: string;
    dotClass: string;
} {
    const name = (roleName ?? 'Stakeholder').toLowerCase();
    if (name.includes('owner') || name.includes('admin')) {
        return {
            label: roleName || 'Admin',
            pillClass:
                'border-violet-500/30 bg-violet-500/10 text-violet-300 shadow-[0_0_10px_rgba(139,92,246,0.12)]',
            dotClass: 'bg-violet-400',
        };
    }
    if (name.includes('dev') || name.includes('engineer')) {
        return {
            label: roleName || 'Developer',
            pillClass:
                'border-sky-500/30 bg-sky-500/10 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.12)]',
            dotClass: 'bg-sky-400',
        };
    }
    if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
        return {
            label: roleName || 'Designer',
            pillClass:
                'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.12)]',
            dotClass: 'bg-emerald-400',
        };
    }
    return {
        label: roleName || 'Stakeholder',
        pillClass:
            'border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.12)]',
        dotClass: 'bg-amber-400',
    };
}

export default function TeamManagementCard({
    users,
    setUsers,
    onAddMember,
    onEditMember,
}: TeamManagementCardProps) {
    const [teamActionError, setTeamActionError] = useState('');
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'dev' | 'design' | 'stakeholder' | 'active' | 'paused'>('all');

    const toggleMember = async (user: WorkspaceUser) => {
        setTogglingId(user.id);
        try {
            const response = await axios.patch(route('settings.team.update', user.id), {
                active: !user.active,
            });
            setUsers((current) =>
                current.map((item) => (item.id === user.id ? response.data.user : item))
            );
            setTeamActionError('');
        } catch (exception: unknown) {
            setTeamActionError(
                isAxiosError(exception)
                    ? (exception.response?.data?.message ?? 'Could not update this account status.')
                    : 'Could not update this account status.'
            );
        } finally {
            setTogglingId(null);
        }
    };

    const counts = useMemo(() => {
        let admins = 0;
        let devs = 0;
        let designs = 0;
        let stakeholders = 0;
        let active = 0;
        let paused = 0;

        users.forEach((u) => {
            if (u.active !== false) active++;
            else paused++;

            const r = (u.role?.name ?? '').toLowerCase();
            if (r.includes('owner') || r.includes('admin')) admins++;
            else if (r.includes('dev') || r.includes('engineer')) devs++;
            else if (r.includes('design') || r.includes('ui') || r.includes('ux')) designs++;
            else stakeholders++;
        });

        return { admins, devs, designs, stakeholders, active, paused };
    }, [users]);

    const filteredUsers = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return users.filter((user) => {
            const matchesQuery =
                !query ||
                user.name.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                (user.email && user.email.toLowerCase().includes(query)) ||
                (user.role?.name && user.role.name.toLowerCase().includes(query));

            if (!matchesQuery) return false;

            if (selectedRoleFilter === 'active') {
                return user.active !== false;
            }
            if (selectedRoleFilter === 'paused') {
                return user.active === false;
            }

            const roleLower = (user.role?.name ?? '').toLowerCase();
            if (selectedRoleFilter === 'admin') {
                return roleLower.includes('owner') || roleLower.includes('admin');
            }
            if (selectedRoleFilter === 'dev') {
                return roleLower.includes('dev') || roleLower.includes('engineer');
            }
            if (selectedRoleFilter === 'design') {
                return roleLower.includes('design') || roleLower.includes('ui') || roleLower.includes('ux');
            }
            if (selectedRoleFilter === 'stakeholder') {
                return (
                    !roleLower.includes('owner') &&
                    !roleLower.includes('admin') &&
                    !roleLower.includes('dev') &&
                    !roleLower.includes('engineer') &&
                    !roleLower.includes('design') &&
                    !roleLower.includes('ui') &&
                    !roleLower.includes('ux')
                );
            }

            return true;
        });
    }, [users, searchQuery, selectedRoleFilter]);

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#111216] p-6 sm:p-7 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-200">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base font-semibold text-zinc-100">Team & Access Control</h2>
                            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 font-mono text-[10px] font-bold text-zinc-300">
                                {users.length} Total Members
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                            Manage account roster, role permissions, authentication credentials, and active states across the studio.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onAddMember}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:bg-zinc-200 active:scale-[0.98]"
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Team Member</span>
                </button>
            </div>

            {/* Error Notification */}
            {teamActionError && (
                <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{teamActionError}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTeamActionError('')}
                        className="text-rose-400 hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Full-Width Search & Filter Toolbar */}
            <div className="mt-5 space-y-3">
                {/* Full-width Search Input */}
                <div className="relative w-full">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter roster by name, username, email, or role title…"
                        className="w-full rounded-xl border border-zinc-800 bg-[#0c0d12] pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* Role Filter Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-zinc-800/60 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setSelectedRoleFilter('all')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                selectedRoleFilter === 'all'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                            }`}
                        >
                            All ({users.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRoleFilter('admin')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                selectedRoleFilter === 'admin'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                            }`}
                        >
                            Admins ({counts.admins})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRoleFilter('dev')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                selectedRoleFilter === 'dev'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                            }`}
                        >
                            Developers ({counts.devs})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRoleFilter('design')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                selectedRoleFilter === 'design'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                            }`}
                        >
                            Designers ({counts.designs})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRoleFilter('stakeholder')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                selectedRoleFilter === 'stakeholder'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                            }`}
                        >
                            Stakeholders ({counts.stakeholders})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRoleFilter('active')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                selectedRoleFilter === 'active'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                            }`}
                        >
                            Active Only ({counts.active})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedRoleFilter('paused')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                selectedRoleFilter === 'paused'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:border-zinc-750 hover:text-zinc-200'
                            }`}
                        >
                            Paused ({counts.paused})
                        </button>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500">
                        Showing {filteredUsers.length} of {users.length} members
                    </div>
                </div>
            </div>

            {/* High-Density Responsive Team Roster Grid: grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#0c0d12] py-16 text-center">
                        <Users className="h-8 w-8 text-zinc-600 mb-2" />
                        <p className="text-xs font-semibold text-zinc-300">No team members match your filter.</p>
                        <p className="text-[11px] text-zinc-500 mt-1">Try adjusting your search query or role selector.</p>
                        {(searchQuery || selectedRoleFilter !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedRoleFilter('all');
                                }}
                                className="mt-3 rounded-lg border border-zinc-750 bg-zinc-850 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const avatar = getAvatarPalette(user.username || user.name);
                        const roleBadge = getRoleBadgeStyle(user.role?.name);

                        return (
                            <div
                                key={user.id}
                                className={`group relative flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-150 ${
                                    user.active !== false
                                        ? 'border-zinc-800 bg-[#0c0d12] hover:border-zinc-700 hover:bg-[#0f1017]'
                                        : 'border-zinc-850 bg-[#090a0f]/60 opacity-70 hover:opacity-100 hover:border-zinc-800 hover:bg-[#0c0d12]'
                                }`}
                            >
                                <div>
                                    {/* Top: Avatar, Names, Role pill, and Active Switch */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            {/* Avatar with Status Dot */}
                                            <div className="relative shrink-0">
                                                <div
                                                    className={`flex h-11 w-11 items-center justify-center rounded-xl border bg-gradient-to-br ${avatar.bg} ${avatar.border} ${avatar.text} text-sm font-bold shadow-inner ring-1 ring-white/[0.04]`}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span
                                                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[#0c0d12] transition-colors ${
                                                        user.active !== false
                                                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                                                            : 'bg-zinc-600'
                                                    }`}
                                                    title={user.active !== false ? 'Active' : 'Inactive'}
                                                />
                                            </div>

                                            {/* Identity & Role */}
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-bold text-zinc-100 group-hover:text-white">
                                                    {user.name}
                                                </p>
                                                <p className="font-mono text-[11px] text-zinc-400 truncate">
                                                    @{user.username}
                                                </p>
                                                <div className="mt-1.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleBadge.pillClass}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${roleBadge.dotClass}`} />
                                                        {roleBadge.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active / Paused Toggle Switch */}
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={user.active !== false}
                                                onClick={() => toggleMember(user)}
                                                disabled={togglingId === user.id}
                                                title={user.active !== false ? 'Deactivate account' : 'Activate account'}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
                                                    user.active !== false
                                                        ? 'border-emerald-500/40 bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                                                        : 'border-zinc-800 bg-zinc-900'
                                                } ${togglingId === user.id ? 'opacity-50 cursor-wait' : ''}`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-sm ring-0 transition duration-200 ease-in-out mt-[2px] ${
                                                        user.active !== false
                                                            ? 'translate-x-[18px] bg-emerald-400'
                                                            : 'translate-x-[2px] bg-zinc-500'
                                                    }`}
                                                />
                                            </button>
                                            <span className="text-[9px] font-mono text-zinc-500">
                                                {user.active !== false ? 'Active' : 'Paused'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Email Address */}
                                    {user.email && (
                                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 truncate">
                                            <Mail className="h-3 w-3 shrink-0 text-zinc-500" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Actions Bar */}
                                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                                    <span className="font-mono text-[10px] text-zinc-500">
                                        UID: #{user.id}
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onEditMember(user)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#111216] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                                            title="Update credentials & login settings"
                                        >
                                            <KeyRound className="h-3 w-3 text-zinc-400" />
                                            <span>Credentials</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onEditMember(user)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300 transition-colors hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-violet-200"
                                            title="Edit member details"
                                        >
                                            <Edit3 className="h-3 w-3 text-violet-400" />
                                            <span>Edit</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

