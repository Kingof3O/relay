import { HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p
            {...props}
            className={'flex items-center gap-1.5 text-xs font-medium text-rose-400 mt-1.5 ' + className}
        >
            <span className="inline-block h-1 w-1 rounded-full bg-rose-400" />
            {message}
        </p>
    ) : null;
}

