import React, { useState, useRef, useEffect } from 'react';
import {
    KanbanSquare,
    ListFilter,
    Plus,
    Download,
    FileSpreadsheet,
    FileCode,
    ChevronDown,
    Keyboard,
} from 'lucide-react';

interface BoardHeaderProps {
    viewMode: 'board' | 'list';
    onViewModeChange: (mode: 'board' | 'list') => void;
    onAddRequest: () => void;
    onOpenShortcuts?: () => void;
}

export default function BoardHeader({
    viewMode,
    onViewModeChange,
    onAddRequest,
    onOpenShortcuts,
}: BoardHeaderProps) {
    const [exportOpen, setExportOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        };

        if (exportOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [exportOpen]);

    const handleExport = (format: 'csv' | 'json') => {
        setExportOpen(false);
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('format', format);
        window.location.href = `/requests/export?${searchParams.toString()}`;
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Tasks Board</h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                    Drag and drop tasks across stages to track your project workflow.
                </p>
            </div>

            <div className="flex items-center gap-2.5">
                {/* View Switcher: Board vs List */}
                <div className="flex items-center rounded-xl border border-zinc-800 bg-[#0d0e12] p-1 shadow-sm">
                    <button
                        type="button"
                        onClick={() => onViewModeChange('board')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            viewMode === 'board'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Kanban Board view"
                    >
                        <KanbanSquare className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Board</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewModeChange('list')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                            viewMode === 'list'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Interactive List/Table view"
                    >
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">List</span>
                    </button>
                </div>

                {/* Export Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setExportOpen((prev) => !prev)}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0d0e12] px-3.5 py-2 text-xs font-medium text-zinc-300 shadow-sm transition-all duration-150 hover:border-zinc-700 hover:bg-[#121318] hover:text-white active:scale-[0.98]"
                        title="Export Backlog Data"
                    >
                        <Download className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Export</span>
                        <ChevronDown className="h-3 w-3 text-zinc-500 transition-transform duration-150" />
                    </button>

                    {exportOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-zinc-800 bg-[#0c0d12] p-1.5 shadow-2xl z-30 backdrop-blur-md animate-in fade-in duration-100 divide-y divide-zinc-800/60">
                            <div className="px-2 py-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                                Data Portability
                            </div>
                            <div className="py-1 space-y-0.5">
                                <button
                                    type="button"
                                    onClick={() => handleExport('csv')}
                                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors group"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400">
                                        <FileSpreadsheet className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-zinc-200 group-hover:text-white">
                                            Export as CSV
                                        </span>
                                        <span className="text-[10px] text-zinc-500">
                                            Standard CSV spreadsheet
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleExport('json')}
                                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors group"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-cyan-400">
                                        <FileCode className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-zinc-200 group-hover:text-white">
                                            Export as JSON
                                        </span>
                                        <span className="text-[10px] text-zinc-500">
                                            Full structured archive
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Keycap Button */}
                <button
                    type="button"
                    onClick={() => {
                        onOpenShortcuts?.();
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('open-shortcuts'));
                        }
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#0d0e12] px-3 py-2 text-xs font-medium text-zinc-400 shadow-sm transition-all duration-150 hover:border-zinc-700 hover:bg-[#121318] hover:text-zinc-200 active:scale-[0.98]"
                    title="Keyboard Shortcuts Cheat-sheet (Press ?)"
                >
                    <Keyboard className="h-3.5 w-3.5 text-zinc-400" />
                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">?</kbd>
                </button>

                {/* Add Request Button */}
                <button
                    type="button"
                    onClick={onAddRequest}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-sm transition-all duration-150 hover:bg-zinc-200 active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Request</span>
                    <kbd className="rounded bg-zinc-200 px-1 py-0.5 text-[9px] font-mono text-zinc-800">C</kbd>
                </button>
            </div>
        </div>
    );
}
