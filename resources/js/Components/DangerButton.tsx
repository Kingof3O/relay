import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all duration-150 ease-out hover:border-rose-400/50 hover:bg-rose-600 hover:text-white hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 focus:ring-offset-[#07090e] active:scale-[0.98] ${
                    disabled ? 'opacity-40 cursor-not-allowed hover:bg-rose-500/10 hover:text-rose-300 active:scale-100' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

