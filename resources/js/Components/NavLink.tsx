import { ComponentProps } from 'react';
import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: ComponentProps<typeof Link> & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-semibold leading-5 transition duration-200 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-zinc-400 hover:border-zinc-750 hover:text-zinc-200') +
                className
            }
        >
            {children}
        </Link>
    );
}
