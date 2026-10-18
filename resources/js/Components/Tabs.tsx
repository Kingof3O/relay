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
                    className={`relative flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-150 ${
                        item.active
                            ? 'border-white text-white'
                            : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                >
                    {item.label}
                    {typeof item.count === 'number' && (
                        <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono tabular-nums ${
                                item.active
                                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
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

