import { PropsWithChildren } from 'react';

export default function Card({
    className = '',
    hoverable = false,
    glow = false,
    variant = 'default',
    children,
}: PropsWithChildren<{
    className?: string;
    hoverable?: boolean;
    glow?: boolean;
    variant?: 'default' | 'elevated' | 'glass' | 'subtle';
}>) {
    const variantStyles = {
        default: 'bg-[#111216] border-white/[0.07] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]',
        elevated: 'bg-[#14151b] border-white/[0.09] shadow-xl shadow-black/50',
        glass: 'bg-[#111216]/90 border-white/[0.07] backdrop-blur-xl',
        subtle: 'bg-[#0d0e12] border-zinc-850',
    }[variant];

    return (
        <div
            className={`relative rounded-xl border ${variantStyles} ${
                hoverable
                    ? 'transition-all duration-150 ease-out hover:border-zinc-700 hover:bg-[#15171d]'
                    : ''
            } ${glow ? 'border-zinc-600 shadow-[0_0_30px_rgba(255,255,255,0.03)]' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
