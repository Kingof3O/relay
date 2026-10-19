import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

export type Crumb = {
    label: string;
    href?: string;
};

export interface PageHeaderProps {
    crumbs?: Crumb[];
    title: ReactNode;
    badge?: ReactNode;
    subtitle?: ReactNode;
    meta?: ReactNode;
    actions?: ReactNode;
    tabs?: ReactNode;
}

export default function PageHeader({
    crumbs = [],
    title,
    badge,
    subtitle,
    meta,
    actions,
    tabs,
}: PageHeaderProps) {
    return (
        <div className="w-full">
            <div className="flex flex-col justify-center gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    {crumbs.length > 0 && (
                        <nav className="flex items-center gap-1.5 text-[11px]" aria-label="Breadcrumb">
                            {crumbs.map((crumb, index) => {
                                const isLast = index === crumbs.length - 1;
                                return (
                                    <span
                                        key={`${index}-${crumb.label}`}
                                        className="flex items-center gap-1.5 min-w-0"
                                    >
                                        {index > 0 && (
                                            <ChevronRight className="h-3 w-3 text-zinc-600 shrink-0" aria-hidden="true" />
                                        )}
                                        {crumb.href && !isLast ? (
                                            <Link
                                                href={crumb.href}
                                                className="max-w-[180px] truncate font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-200"
                                            >
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span
                                                className={`max-w-[220px] truncate ${
                                                    isLast
                                                        ? 'font-medium text-zinc-400'
                                                        : 'font-semibold uppercase tracking-wider text-zinc-400'
                                                }`}
                                            >
                                                {crumb.label}
                                            </span>
                                        )}
                                    </span>
                                );
                            })}
                        </nav>
                    )}

                    <div className="mt-0.5 flex flex-wrap items-center gap-2.5 min-w-0">
                        {typeof title === 'string' ? (
                            <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-100">
                                {title}
                            </h1>
                        ) : (
                            <div className="truncate text-lg font-semibold tracking-tight text-zinc-100">
                                {title}
                            </div>
                        )}

                        {badge && <div className="shrink-0">{badge}</div>}

                        {subtitle && (
                            <div className="shrink-0 text-xs text-zinc-400">
                                {subtitle}
                            </div>
                        )}
                    </div>

                    {meta && (
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                            {meta}
                        </div>
                    )}
                </div>

                {actions && (
                    <div className="flex shrink-0 items-center gap-2 mt-1 sm:mt-0">
                        {actions}
                    </div>
                )}
            </div>

            {tabs && <div className="mt-3">{tabs}</div>}
        </div>
    );
}

export { PageHeader as BreadcrumbHeader };
