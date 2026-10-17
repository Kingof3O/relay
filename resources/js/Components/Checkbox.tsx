import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded-md border-white/10 bg-[#0b0f19] text-violet-600 focus:ring-violet-500/40 focus:ring-offset-0 transition-colors ' +
                className
            }
        />
    );
}

