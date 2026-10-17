import React from 'react';
import { WorkspaceProject, WorkspaceUser } from '@/types/workspace';
import { UseBoardFiltersReturn } from '@/Hooks/useBoardFilters';
import {
    Search,
    Sparkles,
    Clock,
    AlertOctagon,
    Flame,
    SlidersHorizontal,
    RotateCcw,
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
