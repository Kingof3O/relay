export default function Avatar({
    name,
    className = '',
    size = 'md',
}: {
    name?: string | null;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}) {
    const label = (name ?? '').trim();
    const initials = label
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');

    const sizeClasses = {
        sm: 'h-5 w-5 text-[9px]',
        md: 'h-6 w-6 text-[10px]',
        lg: 'h-8 w-8 text-xs',
    };

    return (
        <span
            title={label || 'Unassigned'}
            className={`inline-flex flex-shrink-0 select-none items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/20 to-indigo-600/30 font-bold text-violet-200 shadow-sm backdrop-blur-md ${
                sizeClasses[size]
            } ${label ? '' : 'border-dashed opacity-50'} ${className}`}
        >
            {initials || '?'}
        </span>
    );
}

