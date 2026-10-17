import { ComponentProps } from 'react';
import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: ComponentProps<typeof Link> & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-violet-500 bg-violet-600/10 text-white focus:border-violet-400 focus:bg-violet-600/20'
                    : 'border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/60 hover:text-zinc-200 focus:border-zinc-800'
            } text-base font-semibold transition duration-200 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
