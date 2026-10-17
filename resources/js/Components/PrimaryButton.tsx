import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `relative inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition-all duration-150 ease-out hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-[#090a0f] active:scale-[0.98] ${
                    disabled
                        ? 'cursor-not-allowed opacity-50 hover:bg-white active:scale-100 shadow-none'
                        : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
