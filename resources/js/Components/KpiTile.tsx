import React, { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export interface KpiTileTrend {
    value: string;
    positive?: boolean;
}

export interface KpiTileProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    detail?: ReactNode;
    badge?: ReactNode;
    trend?: KpiTileTrend;
    className?: string;
    href?: string;
    onClick?: (e: React.MouseEvent) => void;
    active?: boolean;
    children?: ReactNode;
    valueClassName?: string;
    iconClassName?: string;
    iconContainerClassName?: string;
}

export default function KpiTile({
    label,
    value,
    icon: Icon,
    detail,
    badge,
    trend,
    className = '',
    href,
    onClick,
    active,
    children,
    valueClassName = '',
    iconClassName = '',
    iconContainerClassName = '',
}: KpiTileProps) {
    const baseClasses = `group relative overflow-hidden rounded-2xl border ${
        active
            ? 'border-zinc-600 bg-[#14151b] shadow-md ring-1 ring-zinc-600'
            : 'border-zinc-800 bg-[#0c0d12] hover:border-zinc-700'
    } p-4 sm:p-5 shadow-sm transition-all text-left flex flex-col justify-between ${className}`.trim();

    const content = (
        <>
            {/* Top specular highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

            <div>
                {/* Label row */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 truncate">
                        {label}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                        {badge}
                        {Icon && (
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm shrink-0 ${iconContainerClassName}`.trim()}
                            >
                                <Icon className={`h-3.5 w-3.5 ${iconClassName}`.trim()} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Metric value */}
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                    <span
                        className={`text-2xl font-bold font-mono tracking-tight tabular-nums ${
                            valueClassName || 'text-white'
                        }`}
                    >
                        {value}
                    </span>
                    {trend && (
                        <span
                            className={`inline-flex items-center gap-0.5 text-xs font-semibold font-mono ${
                                trend.positive !== false ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                        >
                            <span>{trend.positive !== false ? '↑' : '↓'}</span>
                            <span>{trend.value}</span>
                        </span>
                    )}
                </div>

                {/* Detail/subtitle */}
                {detail && <div className="mt-1 text-xs text-zinc-400">{detail}</div>}
            </div>

            {children && <div className="mt-3">{children}</div>}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={baseClasses} onClick={onClick}>
                {content}
            </Link>
        );
    }

    if (onClick) {
        return (
            <button type="button" onClick={onClick} className={baseClasses}>
                {content}
            </button>
        );
    }

    return <div className={baseClasses}>{content}</div>;
}
