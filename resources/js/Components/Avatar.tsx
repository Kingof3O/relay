import React from 'react';
import { getInitials, getAvatarColor } from '@/Utils/avatar';

export interface AvatarProps {
    name?: string | null;
    username?: string | null;
    src?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    presence?: 'online' | 'busy' | 'away' | 'offline';
}

const sizeClasses = {
    xs: 'h-4 w-4 text-[8px]',
    sm: 'h-5 w-5 text-[9px]',
    md: 'h-6 w-6 text-[10px]',
    lg: 'h-8 w-8 text-xs',
    xl: 'h-10 w-10 text-sm',
};

const presenceSizes = {
    xs: 'h-1.5 w-1.5 ring-1',
    sm: 'h-1.5 w-1.5 ring-1',
    md: 'h-2 w-2 ring-1.5',
    lg: 'h-2.5 w-2.5 ring-2',
    xl: 'h-3 w-3 ring-2',
};

const presenceColors = {
    online: 'bg-emerald-400',
    busy: 'bg-rose-400',
    away: 'bg-amber-400',
    offline: 'bg-zinc-500',
};

export default function Avatar({
    name,
    username,
    src,
    size = 'md',
    className = '',
    presence,
}: AvatarProps) {
    const label = (name || username || '').trim();
    const initials = getInitials(name, username);
    const palette = getAvatarColor(label || initials);

    return (
        <span className="relative inline-flex shrink-0">
            {src ? (
                <img
                    src={src}
                    alt={label || 'User'}
                    className={`select-none rounded-full object-cover border border-zinc-750 shadow-sm ${
                        sizeClasses[size]
                    } ${className}`}
                />
            ) : (
                <span
                    title={label || 'Unassigned'}
                    className={`inline-flex select-none items-center justify-center rounded-full border font-bold font-mono shadow-sm transition-all ${
                        palette.bg
                    } ${palette.border} ${palette.text} ${sizeClasses[size]} ${
                        label ? '' : 'border-dashed opacity-50'
                    } ${className}`}
                >
                    {initials}
                </span>
            )}

            {presence && (
                <span
                    className={`absolute bottom-0 right-0 rounded-full ring-[#0c0d12] ${
                        presenceSizes[size]
                    } ${presenceColors[presence]}`}
                    title={presence}
                />
            )}
        </span>
    );
}
