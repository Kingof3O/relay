import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

export type Crumb = {
    label: string;
    href?: string;
};

export default function PageHeader({
    crumbs = [],
    title,
    meta,
    actions,
    tabs,
}: {
    crumbs?: Crumb[];
    title: string;
    meta?: ReactNode;
    actions?: ReactNode;
    tabs?: ReactNode;
}) {
    return (
        <div className="w-full">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    {crumbs.length > 0 && (
                        <nav className="mb-1 flex flex-wrap items-center gap-1.5 text-xs">
                            {crumbs.map((crumb, index) => (
                                <span
                                    key={`${index}-${crumb.label}`}
                                    className="flex items-center gap-1.5"
                                >
                                    {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />}
                                    {crumb.href ? (
                                        <Link
                                            href={crumb.href}
                                            title={crumb.label}
                                            className="max-w-[200px] truncate text-zinc-400 transition-colors hover:text-zinc-200"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span
                                            title={crumb.label}
                                            className="max-w-[200px] truncate font-medium text-zinc-300"
                                        >
                                            {crumb.label}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </nav>
                    )}

                    <h1
                        title={title}
                        className="truncate text-2xl font-bold tracking-tight text-white"
                    >
                        {title}
                    </h1>

                    {meta && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-zinc-400">
                            {meta}
                        </div>
                    )}
                </div>

                {actions && (
                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {tabs && <div className="mt-4">{tabs}</div>}
        </div>
    );
}

