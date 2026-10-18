import React from 'react';
import { KanbanSquare, ListFilter, Plus } from 'lucide-react';

interface BoardHeaderProps {
    viewMode: 'board' | 'list';
    onViewModeChange: (mode: 'board' | 'list') => void;
    onAddRequest: () => void;
}

export default function BoardHeader({
    viewMode,
    onViewModeChange,
    onAddRequest,
}: BoardHeaderProps) {
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
