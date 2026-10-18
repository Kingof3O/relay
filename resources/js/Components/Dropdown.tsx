import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import {
    ComponentProps,
    createContext,
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useContext,
    useState,
} from 'react';

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
});

const Dropdown = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }: PropsWithChildren) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'p-1 bg-[#0d1322]/95 border border-white/[0.1] backdrop-blur-2xl shadow-2xl shadow-specular',
    position = 'down',
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
    position?: 'down' | 'up';
}>) => {
    const { open, setOpen } = useContext(DropDownContext);

    let originClass: string;
    let posClass: string;

    if (position === 'up') {
        posClass = 'bottom-full mb-2';
        if (align === 'left') {
            originClass = 'ltr:origin-bottom-left rtl:origin-bottom-right start-0';
        } else if (align === 'right') {
            originClass = 'ltr:origin-bottom-right rtl:origin-bottom-left end-0';
        } else {
            originClass = 'origin-bottom';
        }
    } else {
        posClass = 'mt-2';
        if (align === 'left') {
            originClass = 'ltr:origin-top-left rtl:origin-top-right start-0';
        } else if (align === 'right') {
            originClass = 'ltr:origin-top-right rtl:origin-top-left end-0';
        } else {
            originClass = 'origin-top';
        }
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            <Transition
                show={open}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    className={`absolute z-50 rounded-xl shadow-2xl ${posClass} ${originClass} ${widthClasses}`}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-xl overflow-hidden ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </>
    );
};

const DropdownLink = ({
    className = '',
    children,
    ...props
}: ComponentProps<typeof Link>) => {
    return (
        <Link
            {...props}
            className={
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs font-medium text-zinc-300 transition duration-150 ease-in-out hover:bg-white/[0.08] hover:text-white focus:bg-white/[0.08] focus:text-white focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;

