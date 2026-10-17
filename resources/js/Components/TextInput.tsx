import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border border-zinc-800 bg-[#14151b] px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm transition-all duration-150 hover:border-zinc-700 focus:border-zinc-500 focus:bg-[#161820] focus:outline-none focus:ring-1 focus:ring-zinc-500 ' +
                className
            }
            ref={localRef}
        />
    );
});

