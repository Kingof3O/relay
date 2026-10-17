import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-300 shadow-specular transition-all duration-150 ease-out hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:ring-offset-2 focus:ring-offset-[#07090e] active:scale-[0.98] ${
                    disabled ? 'opacity-40 cursor-not-allowed hover:bg-white/[0.04] active:scale-100' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}

