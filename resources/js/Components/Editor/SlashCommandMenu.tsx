import React, { useEffect, useState, useRef } from 'react';
import {
    CheckSquare,
    Code,
    Heading2,
    Heading3,
    Table as TableIcon,
    Quote,
    Type,
} from 'lucide-react';

export interface CommandItem {
    id: string;
    title: string;
    description: string;
    shortcut: string;
    icon: React.ComponentType<{ className?: string }>;
    execute: (editor: any) => void;
}

export const SLASH_COMMANDS: CommandItem[] = [
    {
        id: 'todo',
        title: 'To-do List',
        description: 'Interactive checkbox task items',
        shortcut: '/todo',
        icon: CheckSquare,
        execute: (editor) => {
            if (editor.commands.toggleTaskList) {
                editor.commands.toggleTaskList();
            } else {
                editor.chain().focus().insertContent('\n- [ ] ').run();
            }
        },
    },
    {
        id: 'code',
        title: 'Code Block',
        description: 'Fenced monospace code snippet with syntax styling',
        shortcut: '/code',
        icon: Code,
        execute: (editor) => {
            if (editor.commands.toggleCodeBlock) {
                editor.commands.toggleCodeBlock();
            } else {
                editor.chain().focus().insertContent('\n```typescript\n// code here\n```\n').run();
            }
        },
    },
    {
        id: 'h2',
        title: 'Heading 2',
        description: 'Large section heading',
        shortcut: '/h2',
        icon: Heading2,
        execute: (editor) => {
            if (editor.commands.toggleHeading) {
                editor.commands.toggleHeading({ level: 2 });
            }
        },
    },
    {
        id: 'h3',
        title: 'Heading 3',
        description: 'Medium sub-section heading',
        shortcut: '/h3',
        icon: Heading3,
        execute: (editor) => {
            if (editor.commands.toggleHeading) {
                editor.commands.toggleHeading({ level: 3 });
            }
        },
    },
    {
        id: 'table',
        title: 'Table',
        description: 'Structured 3x3 data matrix',
        shortcut: '/table',
        icon: TableIcon,
        execute: (editor) => {
            if (editor.commands.insertTable) {
                editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
            } else {
                editor.chain().focus().insertContent('\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Data 1 | Data 2 | Data 3 |\n').run();
            }
        },
    },
    {
        id: 'quote',
        title: 'Blockquote',
        description: 'Emphasized citation or callout',
        shortcut: '/quote',
        icon: Quote,
        execute: (editor) => {
            if (editor.commands.toggleBlockquote) {
                editor.commands.toggleBlockquote();
            } else {
                editor.chain().focus().insertContent('\n> ').run();
            }
        },
    },
];

interface SlashCommandMenuProps {
    isOpen: boolean;
    query: string;
    onSelect: (command: CommandItem) => void;
    onClose: () => void;
    position?: { top: number; left: number };
}

export default function SlashCommandMenu({
    isOpen,
    query,
    onSelect,
    onClose,
    position,
}: SlashCommandMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    const filtered = SLASH_COMMANDS.filter((cmd) => {
        const cleanQuery = query.toLowerCase().replace(/^\//, '');
        if (!cleanQuery) return true;
        return (
            cmd.title.toLowerCase().includes(cleanQuery) ||
            cmd.id.toLowerCase().includes(cleanQuery) ||
            cmd.shortcut.toLowerCase().includes(cleanQuery) ||
            cmd.description.toLowerCase().includes(cleanQuery)
        );
    });

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    onSelect(filtered[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filtered, selectedIndex, onSelect, onClose]);

    if (!isOpen || filtered.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="absolute z-50 w-72 overflow-hidden rounded-xl border border-white/[0.1] bg-[#090a0f] p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/[0.05] animate-in fade-in zoom-in-95 duration-100"
            style={
                position
                    ? { top: `${position.top}px`, left: `${position.left}px` }
                    : { top: '100%', left: 0 }
            }
        >
            <div className="px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 border-b border-white/[0.06] mb-1">
                Insert Block
            </div>
            <div className="max-h-60 overflow-y-auto custom-scroll space-y-0.5">
                {filtered.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isSelected = idx === selectedIndex;

                    return (
                        <button
                            key={cmd.id}
                            type="button"
                            onClick={() => onSelect(cmd)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors ${
                                isSelected
                                    ? 'bg-violet-600/20 text-white'
                                    : 'text-zinc-300 hover:bg-white/[0.04]'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                                        isSelected
                                            ? 'border-violet-500/40 bg-violet-500/20 text-violet-300'
                                            : 'border-white/[0.08] bg-[#121318] text-zinc-400'
                                    }`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-semibold leading-tight">{cmd.title}</div>
                                    <div className="text-[10px] text-zinc-400 truncate">{cmd.description}</div>
                                </div>
                            </div>
                            <kbd className="shrink-0 font-mono text-[10px] text-zinc-500 px-1 py-0.5 rounded border border-white/[0.08] bg-white/[0.02]">
                                {cmd.shortcut}
                            </kbd>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
