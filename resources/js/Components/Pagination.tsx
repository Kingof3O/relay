import { Link } from '@inertiajs/react';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export default function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className="mt-6 flex flex-wrap items-center gap-1.5">
            {links.map((link, index) => {
                if (link.url === null) {
                    return (
                        <span
                            key={`${index}-${link.label}`}
                            className="cursor-default rounded-xl border border-transparent px-3 py-1.5 text-xs font-medium text-zinc-600"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={`${index}-${link.label}`}
                        href={link.url}
                        preserveScroll
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                            link.active
                                ? 'border-violet-500/40 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.3)] shadow-specular'
                                : 'border-white/[0.08] bg-[#0d1322]/60 text-zinc-400 backdrop-blur-md hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </nav>
    );
}

