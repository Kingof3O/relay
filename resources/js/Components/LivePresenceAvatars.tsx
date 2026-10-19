import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { WorkspaceUser } from '@/types/workspace';
import { Users, Eye } from 'lucide-react';
import { getInitials } from '@/Utils/avatar';

interface PresenceUser {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
    color?: string;
}

interface LivePresenceAvatarsProps {
    requestId: number;
    className?: string;
}

const AVATAR_COLORS = [
    'from-violet-950/80 to-zinc-900 border border-violet-500/40 text-violet-200',
    'from-emerald-950/80 to-zinc-900 border border-emerald-500/40 text-emerald-200',
    'from-sky-950/80 to-zinc-900 border border-sky-500/40 text-sky-200',
    'from-amber-950/80 to-zinc-900 border border-amber-500/40 text-amber-200',
    'from-rose-950/80 to-zinc-900 border border-rose-500/40 text-rose-200',
];

export default function LivePresenceAvatars({ requestId, className = '' }: LivePresenceAvatarsProps) {
    const authUser = usePage<PageProps>().props.auth?.user;
    const [viewers, setViewers] = useState<PresenceUser[]>([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Subscribe to Laravel Echo presence channel if Echo is initialized
        const echo = (window as unknown as { Echo?: any }).Echo;
        if (!echo) return;

        try {
            const channel = echo.join(`request.${requestId}`);

            channel.here((users: PresenceUser[]) => {
                setViewers(users.map((u, i) => ({
                    ...u,
                    color: AVATAR_COLORS[(u.id ?? i) % AVATAR_COLORS.length],
                })));
            });

            channel.joining((user: PresenceUser) => {
                setViewers((prev) => {
                    if (prev.some((u) => u.id === user.id)) return prev;
                    return [...prev, {
                        ...user,
                        color: AVATAR_COLORS[user.id % AVATAR_COLORS.length],
                    }];
                });
            });

            channel.leaving((user: PresenceUser) => {
                setViewers((prev) => prev.filter((u) => u.id !== user.id));
            });

            return () => {
                echo.leave(`request.${requestId}`);
            };
        } catch {
            // Graceful fallback if presence channels are unconfigured in current environment
        }
    }, [requestId]);

    if (viewers.length === 0) return null;

    return (
        <div className={`flex items-center gap-2.5 ${className}`} title="Active viewers on this request">
            <div className="flex -space-x-2 overflow-hidden items-center py-1">
                {viewers.slice(0, 4).map((viewer, index) => {
                    const initials = getInitials(viewer.name, viewer.username);
                    const colorClass = viewer.color || AVATAR_COLORS[index % AVATAR_COLORS.length];

                    return (
                        <div
                            key={viewer.id}
                            className="group relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr text-[10px] font-bold text-white shadow-md ring-2 ring-[#090a0f] hover:z-20 hover:scale-110 transition-all duration-150 select-none"
                            style={{ zIndex: 10 - index }}
                        >
                            <div className={`h-full w-full rounded-full bg-gradient-to-tr ${colorClass} flex items-center justify-center`}>
                                <span>{initials}</span>
                            </div>

                            {/* Active viewing glowing dot */}
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-[#090a0f]" />
                            </span>

                            {/* Tooltip */}
                            <div className="pointer-events-none absolute bottom-full mb-1.5 hidden flex-col items-center group-hover:flex z-30">
                                <span className="whitespace-nowrap rounded-md border border-white/[0.1] bg-[#0c0d12] px-2 py-1 text-[10px] font-medium text-zinc-200 shadow-xl backdrop-blur-md">
                                    {viewer.name || viewer.username}
                                    {authUser && viewer.id === authUser.id ? ' (You)' : ''}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {viewers.length > 4 && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-zinc-850 text-[10px] font-medium text-zinc-300 ring-2 ring-[#090a0f]">
                        +{viewers.length - 4}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-zinc-400">
                    {viewers.length === 1 ? '1 viewing now' : `${viewers.length} viewing now`}
                </span>
            </div>
        </div>
    );
}
