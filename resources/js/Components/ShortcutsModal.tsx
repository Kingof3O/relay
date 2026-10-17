import { useEffect } from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';

interface ShortcutsModalProps {
    open: boolean;
    onClose: () => void;
}

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const sections = [
        {
            title: 'Global Navigation',
            shortcuts: [
                { keys: ['G', 'D'], desc: 'Go to Dashboard' },
                { keys: ['G', 'B'], desc: 'Go to Studio Board' },
                { keys: ['G', 'P'], desc: 'Go to Initiatives (Projects)' },
                { keys: ['G', 'N'], desc: 'Go to Notifications Inbox' },
                { keys: ['G', 'S'], desc: 'Go to Workspace Settings' },
            ],
        },
        {
            title: 'Quick Actions',
            shortcuts: [
                { keys: ['C'], desc: 'New Work Request modal' },
                { keys: ['⌘', 'K'], desc: 'Open Command Palette' },
                { keys: ['?'], desc: 'Open this Keyboard Shortcuts cheat-sheet' },
                { keys: ['/'], desc: 'Focus Board Filter Search' },
                { keys: ['Esc'], desc: 'Close open drawers, modals, or flyouts' },
            ],
        },
        {
            title: 'Studio Board & Kanban',
            shortcuts: [
                { keys: ['Space'], desc: 'Open Quick View Drawer for selected card' },
                { keys: ['⌘', 'Enter'], desc: 'Submit active work request form' },
                { keys: ['⌘', '⇧', 'C'], desc: 'Copy direct request link' },
                { keys: ['⌘', 'Z'], desc: 'Undo last card transition' },
            ],
        },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in-0 duration-150"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] shadow-specular backdrop-blur-2xl ring-1 ring-white/[0.04] transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Specular top light */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    aria-hidden="true"
                />

                {/* Raycast-Style Obsidian Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-[#07090e]/60">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-[#121318] text-violet-400 shadow-specular">
                            <Keyboard className="h-4 w-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white tracking-tight">Keyboard Shortcuts</h3>
                                <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    <span>Raycast Mode</span>
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">Power user hotkeys and navigation shortcuts</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            <kbd>Esc</kbd>
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors"
                            aria-label="Close shortcuts modal"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scroll">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
                                <span>{section.title}</span>
                            </h4>
                            <div className="rounded-xl border border-white/[0.08] bg-[#07090e]/70 divide-y divide-white/[0.04] overflow-hidden shadow-inner">
                                {section.shortcuts.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-white/[0.03] transition-colors"
                                    >
                                        <span className="text-zinc-300 font-medium">{s.desc}</span>
                                        <div className="flex items-center gap-1.5">
                                            {s.keys.map((k, kIdx) => (
                                                <kbd
                                                    key={kIdx}
                                                    className="flex h-5 min-w-5 items-center justify-center rounded border border-white/[0.12] bg-[#121318] px-1.5 font-mono text-[10px] font-semibold text-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                                                >
                                                    {k}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t border-white/[0.08] bg-[#07090e]/80 px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                        Press <kbd className="px-1.5 py-0.5 rounded border border-white/[0.1] bg-white/[0.04] text-zinc-300 font-mono text-[10px]">?</kbd> anywhere to summon
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">Relay Studio · Linear Ergonomics</span>
                </div>
            </div>
        </div>
    );
}
