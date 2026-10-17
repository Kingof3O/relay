import { Link } from '@inertiajs/react';

export type TabItem = {
    label: string;
    href: string;
    active: boolean;
    count?: number;
};

export default function Tabs({ items }: { items: TabItem[] }) {
    return (
        <nav className="-mb-px flex gap-2 border-b border-white/[0.08] pb-px">
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${
                        item.active
                            ? 'border-cyan-400 text-white'
                            : 'border-transparent text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    {item.label}
                    {typeof item.count === 'number' && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                                item.active
                                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                                    : 'bg-white/[0.06] text-zinc-400'
                            }`}
                        >
                            {item.count}
                        </span>
                    )}
                </Link>
            ))}
        </nav>
    );
}

