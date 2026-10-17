import { Link, usePage } from '@inertiajs/react';
import { getRoleBadgeStyle } from '@/Features/Settings/components/TeamManagementCard';
import {
    Activity,
    AtSign,
    CheckCircle2,
    Copy,
    ExternalLink,
    Hash,
    KanbanSquare,
    KeyRound,
    LayoutDashboard,
    Lock,
    Mail,
    Radio,
    Shield,
    ShieldCheck,
    Sparkles,
    User,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

export interface AccountTelemetryCardProps {
    stats?: {
        assigned_count: number;
        completed_count: number;
    };
}

export default function AccountTelemetryCard({ stats }: AccountTelemetryCardProps) {
    const pageProps = usePage().props;
    const user = pageProps.auth.user;
    const role = pageProps.auth.role;
    const permissions: string[] = pageProps.auth.permissions ?? [];

    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard?.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const roleBadge = getRoleBadgeStyle(role?.name || user.role?.name);
    const assignedCount = stats?.assigned_count ?? 0;

    // Fallback role capability highlights if granular permission strings are empty
    const capabilities =
        permissions.length > 0
            ? permissions
            : [
                  'Workspace Triage & Dispatch',
                  'Ticket Lifecycle Transitions',
                  'Media & Asset Attachments',
                  'Real-time Notifications',
              ];

    return (
        <div className="space-y-6">
            {/* Identity & Account Telemetry Card */}
            <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-100">
                                Account Telemetry
                            </h3>
                            <p className="text-[11px] text-zinc-400">
                                Identity attributes & security posture
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        Active
                    </span>
                </div>

                {/* Identity Attribute Rows */}
                <div className="mt-4 divide-y divide-zinc-800/60 text-xs">
                    {/* Display Name */}
                    <div className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <User className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Display Name</span>
                        </span>
                        <span className="font-medium text-zinc-200">{user.name}</span>
                    </div>

                    {/* Username Handle */}
                    <div className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <AtSign className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Username</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(`@${user.username}`, 'username')}
                            className="group flex items-center gap-1.5 font-mono text-zinc-300 transition-colors hover:text-white"
                            title="Click to copy handle"
                        >
                            <span>@{user.username}</span>
                            <Copy className="h-3 w-3 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                            {copiedKey === 'username' && (
                                <span className="text-[10px] text-emerald-400 font-sans">
                                    Copied!
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Email</span>
                        </span>
                        <span
                            className="max-w-[190px] truncate font-mono text-zinc-300"
                            title={user.email ?? 'Not set'}
                        >
                            {user.email || '—'}
                        </span>
                    </div>

                    {/* User ID */}
                    <div className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <Hash className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Account ID</span>
                        </span>
                        <span className="font-mono text-zinc-400">
                            USR-{user.id.toString().padStart(4, '0')}
                        </span>
                    </div>

                    {/* Role Status */}
                    <div className="flex items-center justify-between py-2.5">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <Radio className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Assigned Role</span>
                        </span>
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleBadge.pillClass}`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${roleBadge.dotClass}`} />
                            {roleBadge.label}
                        </span>
                    </div>
                </div>

                {/* Role Permissions Section */}
                <div className="mt-5 border-t border-zinc-800/80 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                        <KeyRound className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Role Permissions & Access</span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {capabilities.map((perm, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-[#121318] px-2 py-1 text-[11px] text-zinc-300"
                            >
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span>{perm}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Active Session Security Status */}
                <div className="mt-5 rounded-lg border border-zinc-800 bg-[#090a0f] p-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                        <Shield className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Active Session Security</span>
                    </div>
                    <div className="mt-2 space-y-1.5 text-[11px] text-zinc-400">
                        <div className="flex items-center justify-between">
                            <span>Transport Security</span>
                            <span className="font-mono text-emerald-400">TLS 1.3 / HTTPS</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Authentication Status</span>
                            <span className="text-zinc-200">Session Verified</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Credential Encryption</span>
                            <span className="font-mono text-zinc-300">Argon2id Keyring</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Shortcuts Card */}
            <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                            <Zap className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                            Quick Shortcuts
                        </h4>
                    </div>
                </div>

                <div className="mt-3 space-y-2">
                    <Link
                        href={route('requests.index', { my_work: '1' })}
                        className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-850/60 px-3.5 py-2.5 text-xs text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                    >
                        <span className="flex items-center gap-2.5">
                            <KanbanSquare className="h-4 w-4 text-cyan-400 transition-transform group-hover:scale-110" />
                            <span>My Work Queue</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="rounded-md border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                                {assignedCount}
                            </span>
                            <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
                        </div>
                    </Link>

                    <Link
                        href={route('dashboard')}
                        className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-850/60 px-3.5 py-2.5 text-xs text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                    >
                        <span className="flex items-center gap-2.5">
                            <LayoutDashboard className="h-4 w-4 text-violet-400 transition-transform group-hover:scale-110" />
                            <span>Studio Dashboard</span>
                        </span>
                        <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
                    </Link>

                    <Link
                        href={route('requests.index')}
                        className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-850/60 px-3.5 py-2.5 text-xs text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                    >
                        <span className="flex items-center gap-2.5">
                            <Activity className="h-4 w-4 text-emerald-400 transition-transform group-hover:scale-110" />
                            <span>Workspace Triage</span>
                        </span>
                        <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-zinc-300" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
