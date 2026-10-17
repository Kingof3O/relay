import { PropsWithChildren } from 'react';

type BadgeVariant = 'violet' | 'emerald' | 'rose' | 'zinc' | 'fuchsia' | 'indigo' | 'amber' | 'cyan' | 'orange' | 'blue';

export default function Badge({
    variant = 'zinc',
    dot = false,
    className = '',
    children,
}: PropsWithChildren<{ variant?: BadgeVariant; dot?: boolean; className?: string }>) {
    const config = {
        violet: {
            container: 'bg-violet-500/10 text-violet-300 border-violet-400/25',
            dot: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]',
        },
        emerald: {
            container: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/25',
            dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
        },
        rose: {
            container: 'bg-rose-500/10 text-rose-300 border-rose-400/25',
            dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
        },
        zinc: {
            container: 'bg-zinc-800/60 text-zinc-300 border-white/[0.08]',
            dot: 'bg-zinc-400',
        },
        fuchsia: {
            container: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/25',
            dot: 'bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)]',
        },
        indigo: {
            container: 'bg-indigo-500/10 text-indigo-300 border-indigo-400/25',
            dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]',
        },
        amber: {
            container: 'bg-amber-500/10 text-amber-300 border-amber-400/25',
            dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
        },
        cyan: {
            container: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/25',
            dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
        },
        orange: {
            container: 'bg-orange-500/10 text-orange-300 border-orange-400/25',
            dot: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]',
        },
        blue: {
            container: 'bg-blue-500/10 text-blue-300 border-blue-400/25',
            dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
        },
    }[variant];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-md transition-all ${config.container} ${className}`}
        >
            {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />}
            {children}
        </span>
    );
}

