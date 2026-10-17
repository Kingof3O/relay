import Card from '@/Components/Card';
import { Link } from '@inertiajs/react';

export type StatSub = {
    text: string;
    tone?: 'neutral' | 'positive' | 'attention';
};

export default function StatCard({
    label,
    value,
    sub,
    href,
}: {
    label: string;
    value: number;
    sub?: StatSub;
    href?: string;
}) {
    const toneClass =
        sub?.tone === 'positive'
            ? 'text-emerald-400'
            : sub?.tone === 'attention'
              ? 'text-amber-400'
              : 'text-zinc-500';

    const body = (
        <Card hoverable={Boolean(href)} className="flex h-full flex-col justify-between gap-4 p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                {label}
            </span>

            <div>
                <div className="text-3xl font-extrabold tabular-nums tracking-tight text-white sm:text-4xl">
                    {value}
                </div>
                {sub && (
                    <div className={`mt-1.5 text-xs font-semibold ${toneClass}`}>{sub.text}</div>
                )}
            </div>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full focus:outline-none">
                {body}
            </Link>
        );
    }

    return body;
}

