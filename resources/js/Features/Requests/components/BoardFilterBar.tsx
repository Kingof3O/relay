import React, { useState } from 'react';
import { WorkspaceProject, WorkspaceUser } from '@/types/workspace';
import { UseBoardFiltersReturn } from '@/Hooks/useBoardFilters';
import { router } from '@inertiajs/react';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import {
    Search,
    Sparkles,
    Clock,
    AlertOctagon,
    Flame,
    SlidersHorizontal,
    RotateCcw,
    BookmarkPlus,
    X,
} from 'lucide-react';

interface BoardFilterBarProps {
    filters: UseBoardFiltersReturn;
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
}

export default function BoardFilterBar({
    filters,
    projects,
    users,
    statuses,
    priorities,
}: BoardFilterBarProps) {
    const {
        preset,
        setPreset,
        counts,
        search,
        setSearch,
        showAdvancedFilters,
        setShowAdvancedFilters,
        isFiltered,
        resetFilters,
        selectedProject,
        setSelectedProject,
        owner,
        setOwner,
        requester,
        setRequester,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
    } = filters;

    const [showSaveModal, setShowSaveModal] = useState(false);
    const [viewName, setViewName] = useState('');
    const [savingView, setSavingView] = useState(false);

    const handleSaveView = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = viewName.trim();
        if (!trimmed) return;

        setSavingView(true);
        try {
            await axios.post(
                route('saved-views.store'),
                {
                    name: trimmed,
                    icon: 'filter',
                    filters: {
                        project: selectedProject || undefined,
                        owner: owner || undefined,
                        requester: requester || undefined,
                        status: statusFilter || undefined,
                        priority: priorityFilter || undefined,
                        search: search || undefined,
                        preset: preset !== 'all' ? preset : undefined,
                    },
                    is_pinned: true,
                },
                { headers: { Accept: 'application/json' } }
            );

            toast.success(`View "${trimmed}" saved and pinned to sidebar.`);
            setViewName('');
            setShowSaveModal(false);
            router.reload();
        } catch (err: unknown) {
            const msg = isAxiosError(err)
                ? (err.response?.data?.message ?? 'Could not save view.')
                : 'Could not save view.';
            toast.error(msg);
        } finally {
            setSavingView(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* 1-CLICK PRESET FILTER BAR (Linear Style) */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#0d0e12] p-1.5 shadow-sm">
                <div className="flex flex-wrap items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setPreset('all')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            preset === 'all'
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                        }`}
                    >
                        <span>All Work</span>
                        <span className="rounded bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300">
                            {counts.all}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPreset('my')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            preset === 'my'
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                        }`}
                    >
                        <Sparkles className="h-3 w-3 text-zinc-400" />
                        <span>My Tasks</span>
                        <span className="rounded bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300 font-semibold">
                            {counts.my}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPreset('review')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            preset === 'review'
                                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/60'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                        }`}
                    >
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span>In Review</span>
                        {counts.review > 0 && (
                            <span className="rounded bg-zinc-700/60 px-1.5 py-0.2 text-[10px] text-zinc-300 font-semibold">
                                {counts.review}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setPreset('blocked')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            preset === 'blocked'
                                ? 'bg-zinc-800 text-rose-300 shadow-sm border border-rose-900/40'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                        }`}
                    >
                        <AlertOctagon className="h-3 w-3 text-rose-400" />
                        <span>Blocked</span>
                        {counts.blocked > 0 && (
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-300 font-semibold">
                                {counts.blocked}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setPreset('urgent')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            preset === 'urgent'
                                ? 'bg-zinc-800 text-amber-300 shadow-sm border border-amber-900/40'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                        }`}
                    >
                        <Flame className="h-3 w-3 text-amber-400" />
                        <span>Urgent</span>
                        {counts.urgent > 0 && (
                            <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-300 font-semibold">
                                {counts.urgent}
                            </span>
                        )}
                    </button>
                </div>

                {/* Search & Toggle Advanced Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-56">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                        <input
                            id="board-search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search board..."
                            className="w-full rounded-lg border border-zinc-800 bg-[#14151b] pl-9 pr-7 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                        />
                        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-zinc-750 bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono text-zinc-500">
                            /
                        </kbd>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            showAdvancedFilters
                                ? 'border-zinc-600 bg-zinc-800 text-zinc-100'
                                : 'border-zinc-800 bg-zinc-850 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Toggle advanced filters"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Filters</span>
                    </button>

                    {/* Save View Action Button & Modal */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowSaveModal(!showSaveModal)}
                            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-850 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:border-violet-500/50 hover:bg-violet-950/20 hover:text-violet-200 transition-colors"
                            title="Save current filters as a custom view"
                        >
                            <BookmarkPlus className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Save View</span>
                        </button>

                        {showSaveModal && (
                            <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-zinc-700/80 bg-[#12131a] p-3 shadow-2xl ring-1 ring-black/50">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                    <span className="text-xs font-semibold text-zinc-200">Save Custom View</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowSaveModal(false)}
                                        className="text-zinc-500 hover:text-zinc-300"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSaveView} className="mt-2.5 space-y-2.5">
                                    <input
                                        type="text"
                                        placeholder="View name (e.g. Mobile Bugs)..."
                                        autoFocus
                                        value={viewName}
                                        onChange={(e) => setViewName(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-750 bg-[#08090d] px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    />
                                    <div className="flex items-center justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowSaveModal(false)}
                                            className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={savingView || !viewName.trim()}
                                            className="rounded-lg border border-violet-500/50 bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-40 transition-colors"
                                        >
                                            {savingView ? 'Saving...' : 'Save & Pin'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {isFiltered && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 px-1"
                            title="Reset all filters"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span className="hidden lg:inline">Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* PROJECT FILTER CHIPS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 pr-1 shrink-0">
                    Project:
                </span>
                <button
                    type="button"
                    onClick={() => setSelectedProject('')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                        selectedProject === ''
                            ? 'bg-zinc-800 text-white border border-zinc-700/60'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                >
                    All Projects
                </button>
                {projects.map((proj) => {
                    const active = selectedProject === String(proj.id);
                    return (
                        <button
                            key={proj.id}
                            type="button"
                            onClick={() => setSelectedProject(active ? '' : String(proj.id))}
                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                                active
                                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                            }`}
                        >
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: proj.color ?? '#71717a' }}
                            />
                            <span>{proj.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* ADVANCED ACCORDION FILTERS */}
            {showAdvancedFilters && (
                <div className="grid gap-2.5 rounded-xl border border-zinc-800 bg-[#111216] p-3 text-xs shadow-sm sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-150">
                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Assignee</label>
                        <select
                            value={owner}
                            onChange={(e) => setOwner(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        >
                            <option value="">All assignees</option>
                            {users.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Requester</label>
                        <select
                            value={requester}
                            onChange={(e) => setRequester(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        >
                            <option value="">All requesters</option>
                            {users.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Status Column</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        >
                            <option value="">All statuses</option>
                            {Object.entries(statuses).map(([val, lbl]) => (
                                <option key={val} value={val}>
                                    {lbl}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Priority Level</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-zinc-800 bg-[#14151b] px-3 py-1.5 text-xs text-zinc-300 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                        >
                            <option value="">All priorities</option>
                            {Object.entries(priorities).map(([val, lbl]) => (
                                <option key={val} value={val}>
                                    {lbl}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
