import { WorkspaceProject } from '@/types/workspace';
import axios, { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';
import {
    FolderKanban,
    Plus,
    ArrowUp,
    ArrowDown,
    Edit2,
    Archive,
    RotateCcw,
    AlertCircle,
    Check,
    X,
    Activity,
    Layers,
    Search,
    LayoutGrid,
    List,
} from 'lucide-react';

export interface ProjectsManagementCardProps {
    projects: WorkspaceProject[];
    setProjects: React.Dispatch<React.SetStateAction<WorkspaceProject[]>>;
    canManageAreas: boolean;
}

const COLOR_SWATCHES = [
    { name: 'Violet', hex: '#8B5CF6' },
    { name: 'Cyan', hex: '#06B6D4' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Amber', hex: '#F59E0B' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Indigo', hex: '#6366F1' },
    { name: 'Rose', hex: '#F43F5E' },
];

export default function ProjectsManagementCard({
    projects,
    setProjects,
    canManageAreas,
}: ProjectsManagementCardProps) {
    const [newProject, setNewProject] = useState('');
    const [newProjectColor, setNewProjectColor] = useState('#8B5CF6');
    const [projectError, setProjectError] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [colorPickerProjectId, setColorPickerProjectId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterState, setFilterState] = useState<'all' | 'active' | 'archived'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    const addProject = async () => {
        if (!newProject.trim() || adding) return;

        setAdding(true);
        try {
            const response = await axios.post(route('settings.projects.store'), {
                name: newProject.trim(),
                color: newProjectColor,
            });
            const created = response.data.project;
            setProjects((current) => [
                ...current,
                { ...created, active_count: 0 },
            ]);
            setNewProject('');
            setProjectError('');
        } catch (exception: unknown) {
            setProjectError(
                isAxiosError(exception)
                    ? (exception.response?.data?.message ?? 'Could not add the project.')
                    : 'Could not add the project.'
            );
        } finally {
            setAdding(false);
        }
    };

    const startInlineRename = (project: WorkspaceProject) => {
        setEditingProjectId(project.id);
        setEditingName(project.name);
    };

    const saveInlineRename = async (projectId: number) => {
        if (!editingName.trim()) {
            setEditingProjectId(null);
            return;
        }

        try {
            const response = await axios.patch(route('settings.projects.update', projectId), {
                name: editingName.trim(),
            });
            const updated = response.data.project;
            setProjects((current) =>
                current.map((item) => (item.id === projectId ? { ...item, ...updated } : item))
            );
            setEditingProjectId(null);
            setProjectError('');
        } catch (exception: unknown) {
            setProjectError(
                isAxiosError(exception)
                    ? (exception.response?.data?.message ?? 'Could not rename the project.')
                    : 'Could not rename the project.'
            );
        }
    };

    const updateProjectColor = async (project: WorkspaceProject, color: string) => {
        try {
            const response = await axios.patch(route('settings.projects.update', project.id), {
                color,
            });
            const updated = response.data.project;
            setProjects((current) =>
                current.map((item) => (item.id === project.id ? { ...item, ...updated, color } : item))
            );
            setColorPickerProjectId(null);
            setProjectError('');
        } catch (exception: unknown) {
            setProjectError(
                isAxiosError(exception)
                    ? (exception.response?.data?.message ?? 'Could not update project color.')
                    : 'Could not update project color.'
            );
        }
    };

    const archiveProject = async (project: WorkspaceProject) => {
        if (!window.confirm(`Archive "${project.name}"? Active requests will remain preserved.`)) {
            return;
        }

        try {
            await axios.delete(route('settings.projects.destroy', project.id));
            setProjects((current) =>
                current.map((item) =>
                    item.id === project.id ? { ...item, archived_at: new Date().toISOString() } : item
                )
            );
            setProjectError('');
        } catch (exception: unknown) {
            setProjectError(
                isAxiosError(exception)
                    ? (exception.response?.data?.message ?? 'Could not archive the project.')
                    : 'Could not archive the project.'
            );
        }
    };

    const restoreProject = async (project: WorkspaceProject) => {
        try {
            const response = await axios.patch(route('settings.projects.update', project.id), {
                archived: false,
            });
            const updated = response.data.project;
            setProjects((current) =>
                current.map((item) =>
                    item.id === project.id ? { ...item, ...updated, archived_at: null } : item
                )
            );
            setProjectError('');
        } catch (exception: unknown) {
            setProjectError(
                isAxiosError(exception)
                    ? (exception.response?.data?.message ?? 'Could not restore the project.')
                    : 'Could not restore the project.'
            );
        }
    };

    const moveProject = async (index: number, direction: -1 | 1) => {
        const next = [...projects];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;

        [next[index], next[target]] = [next[target], next[index]];
        setProjects(next);

        try {
            await axios.post(route('settings.projects.reorder'), {
                order: next.map((project) => project.id),
            });
        } catch (exception: unknown) {
            setProjectError(
                isAxiosError(exception)
                    ? (exception.response?.data?.message ?? 'Could not reorder projects.')
                    : 'Could not reorder projects.'
            );
        }
    };

    const activeCount = projects.filter((p) => !p.archived_at).length;
    const archivedCount = projects.filter((p) => Boolean(p.archived_at)).length;

    const filteredProjects = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return projects.filter((project) => {
            const matchesQuery =
                !query ||
                project.name.toLowerCase().includes(query) ||
                (project.slug && project.slug.toLowerCase().includes(query));

            if (!matchesQuery) return false;

            if (filterState === 'active') return !project.archived_at;
            if (filterState === 'archived') return Boolean(project.archived_at);

            return true;
        });
    }, [projects, searchQuery, filterState]);

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#111216] p-6 sm:p-7 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-800/80 pb-5">
                <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-violet-400">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base font-semibold text-zinc-100">Projects</h2>
                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-violet-300">
                                {activeCount} Active
                            </span>
                            {archivedCount > 0 && (
                                <span className="rounded-full border border-zinc-800 bg-[#0c0d12] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                                    {archivedCount} Archived
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs text-zinc-400">
                            Organize tasks into projects with custom colors, order, and status tracking.
                        </p>
                    </div>
                </div>

                {canManageAreas && (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Swatch Selector for New Project */}
                        <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-[#0c0d12] px-2 py-1.5">
                            {COLOR_SWATCHES.slice(0, 5).map((swatch) => (
                                <button
                                    key={swatch.hex}
                                    type="button"
                                    onClick={() => setNewProjectColor(swatch.hex)}
                                    title={swatch.name}
                                    className={`h-4 w-4 rounded-full transition-transform ${
                                        newProjectColor === swatch.hex
                                            ? 'scale-125 ring-2 ring-white shadow-sm'
                                            : 'opacity-70 hover:opacity-100 hover:scale-110'
                                    }`}
                                    style={{ backgroundColor: swatch.hex }}
                                />
                            ))}
                        </div>

                        <input
                            value={newProject}
                            onChange={(e) => setNewProject(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addProject();
                                }
                            }}
                            placeholder="New project name…"
                            className="w-48 sm:w-60 rounded-xl border border-zinc-800 bg-[#0c0d12] px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                        />

                        <button
                            type="button"
                            onClick={addProject}
                            disabled={adding || !newProject.trim()}
                            className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" />
                            <span>{adding ? 'Adding…' : 'Add Project'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Error Notification */}
            {projectError && (
                <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{projectError}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setProjectError('')}
                        className="text-rose-400 hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Full-Width Search & View Controls Bar */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex flex-1 items-center gap-2 max-w-md">
                    <div className="relative w-full">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter initiatives by name or slug…"
                            className="w-full rounded-xl border border-zinc-800 bg-[#0c0d12] pl-9 pr-9 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setFilterState('all')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                filterState === 'all'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            All ({projects.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterState('active')}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                filterState === 'active'
                                    ? 'border border-violet-500/40 bg-violet-500/15 text-violet-300'
                                    : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            Active ({activeCount})
                        </button>
                        {archivedCount > 0 && (
                            <button
                                type="button"
                                onClick={() => setFilterState('archived')}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                    filterState === 'archived'
                                        ? 'border border-rose-500/40 bg-rose-500/15 text-rose-300'
                                        : 'border border-zinc-850 bg-[#0c0d12] text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                Archived ({archivedCount})
                            </button>
                        )}
                    </div>

                    {/* View Switcher: Grid vs Table */}
                    <div className="flex items-center rounded-lg border border-zinc-800 bg-[#0c0d12] p-0.5">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Grid View (High-Density Multi-Column)"
                        >
                            <LayoutGrid className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                            title="Table View (Compact Rows)"
                        >
                            <List className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* View Presentation */}
            {filteredProjects.length === 0 ? (
                <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#0c0d12] py-16 text-center">
                    <FolderKanban className="h-8 w-8 text-zinc-600 mb-2" />
                    <p className="text-xs font-semibold text-zinc-300">No initiatives match your filter.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Try adjusting your search query or status filter.</p>
                    {(searchQuery || filterState !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setFilterState('all');
                            }}
                            className="mt-3 rounded-lg border border-zinc-750 bg-zinc-850 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* High-Density Multi-Column Grid View: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 */
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => {
                        const originalIndex = projects.findIndex((p) => p.id === project.id);
                        const isEditing = editingProjectId === project.id;
                        const isPickingColor = colorPickerProjectId === project.id;
                        const projectColor = project.color || '#8B5CF6';

                        return (
                            <div
                                key={project.id}
                                className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-150 ${
                                    project.archived_at
                                        ? 'border-zinc-850 bg-[#090a0f]/60 opacity-60 hover:opacity-100 hover:border-zinc-800'
                                        : 'border-zinc-800 bg-[#0c0d12] hover:border-zinc-700 hover:bg-[#0f1017]'
                                }`}
                            >
                                <div>
                                    {/* Top Bar: Color Swatch + Position + Badges */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {/* Color Swatch Trigger */}
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        canManageAreas &&
                                                        setColorPickerProjectId(
                                                            isPickingColor ? null : project.id
                                                        )
                                                    }
                                                    title={
                                                        canManageAreas
                                                            ? 'Click to change initiative color'
                                                            : undefined
                                                    }
                                                    className={`relative h-5 w-5 rounded-md shadow-sm transition-transform ring-1 ring-white/10 ${
                                                        canManageAreas ? 'hover:scale-110 cursor-pointer' : ''
                                                    }`}
                                                    style={{ backgroundColor: projectColor }}
                                                />

                                                {/* Color Palette Popover */}
                                                {isPickingColor && canManageAreas && (
                                                    <div className="absolute left-0 top-7 z-20 flex gap-1.5 rounded-xl border border-zinc-700 bg-[#14151b] p-2 shadow-2xl backdrop-blur-xl">
                                                        {COLOR_SWATCHES.map((swatch) => (
                                                            <button
                                                                key={swatch.hex}
                                                                type="button"
                                                                onClick={() =>
                                                                    updateProjectColor(project, swatch.hex)
                                                                }
                                                                title={swatch.name}
                                                                className={`h-4 w-4 rounded-full transition-transform ${
                                                                    projectColor === swatch.hex
                                                                        ? 'scale-125 ring-2 ring-white'
                                                                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                                                                }`}
                                                                style={{ backgroundColor: swatch.hex }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <span className="font-mono text-[11px] font-semibold text-zinc-500">
                                                #{originalIndex + 1}
                                            </span>
                                        </div>

                                        {/* Active Request Count Badge */}
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold"
                                                style={{
                                                    borderColor: `${projectColor}40`,
                                                    backgroundColor: `${projectColor}15`,
                                                    color: projectColor,
                                                }}
                                            >
                                                <Activity className="h-3 w-3" />
                                                <span>{project.active_count ?? 0} active</span>
                                            </span>

                                            {project.archived_at && (
                                                <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-400">
                                                    Archived
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Project Name / Inline Editor */}
                                    <div className="mt-3.5">
                                        {isEditing ? (
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveInlineRename(project.id);
                                                        if (e.key === 'Escape') setEditingProjectId(null);
                                                    }}
                                                    autoFocus
                                                    className="w-full rounded-lg border border-violet-500 bg-[#090a0f] px-2.5 py-1 text-xs text-white focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => saveInlineRename(project.id)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                                    title="Save"
                                                >
                                                    <Check className="h-3 w-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingProjectId(null)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                                                    title="Cancel"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white">
                                                    {project.name}
                                                </h3>
                                                <p className="mt-0.5 font-mono text-[11px] text-zinc-500 truncate">
                                                    {project.slug ? `/${project.slug}` : 'No slug configured'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Controls / Actions */}
                                {canManageAreas && (
                                    <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
                                        {/* Reorder Buttons */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                disabled={originalIndex === 0}
                                                onClick={() => moveProject(originalIndex, -1)}
                                                className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                title="Move Up"
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                disabled={originalIndex === projects.length - 1}
                                                onClick={() => moveProject(originalIndex, 1)}
                                                className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                title="Move Down"
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Rename & Archive Actions */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => startInlineRename(project)}
                                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-violet-300 hover:bg-violet-500/10 transition-colors"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                                <span>Rename</span>
                                            </button>

                                            {project.archived_at ? (
                                                <button
                                                    type="button"
                                                    onClick={() => restoreProject(project)}
                                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    <span>Restore</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => archiveProject(project)}
                                                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-rose-300 hover:bg-rose-500/10 transition-colors"
                                                >
                                                    <Archive className="h-3 w-3" />
                                                    <span>Archive</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* High-Density Table View */
                <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0d12]">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-zinc-800 bg-zinc-900/40 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            <tr>
                                <th className="px-4 py-3 w-16">#</th>
                                <th className="px-4 py-3">Project</th>
                                <th className="px-4 py-3 hidden sm:table-cell">Slug</th>
                                <th className="px-4 py-3">Tasks</th>
                                <th className="px-4 py-3 hidden md:table-cell">Status</th>
                                {canManageAreas && <th className="px-4 py-3 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                            {filteredProjects.map((project) => {
                                const originalIndex = projects.findIndex((p) => p.id === project.id);
                                const isEditing = editingProjectId === project.id;
                                const isPickingColor = colorPickerProjectId === project.id;
                                const projectColor = project.color || '#8B5CF6';

                                return (
                                    <tr
                                        key={project.id}
                                        className={`transition-colors ${
                                            project.archived_at
                                                ? 'bg-[#090a0f]/40 opacity-60 hover:opacity-90'
                                                : 'hover:bg-zinc-850/40'
                                        }`}
                                    >
                                        {/* Order */}
                                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                                            #{originalIndex + 1}
                                        </td>

                                        {/* Initiative & Color */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            canManageAreas &&
                                                            setColorPickerProjectId(
                                                                isPickingColor ? null : project.id
                                                            )
                                                        }
                                                        className="h-4 w-4 rounded-md shadow-sm transition-transform hover:scale-110"
                                                        style={{ backgroundColor: projectColor }}
                                                        title="Click to change color"
                                                    />
                                                    {isPickingColor && canManageAreas && (
                                                        <div className="absolute left-0 top-6 z-20 flex gap-1.5 rounded-xl border border-zinc-700 bg-[#14151b] p-2 shadow-2xl backdrop-blur-xl">
                                                            {COLOR_SWATCHES.map((swatch) => (
                                                                <button
                                                                    key={swatch.hex}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        updateProjectColor(project, swatch.hex)
                                                                    }
                                                                    title={swatch.name}
                                                                    className="h-4 w-4 rounded-full transition-transform hover:scale-110"
                                                                    style={{ backgroundColor: swatch.hex }}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {isEditing ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="text"
                                                            value={editingName}
                                                            onChange={(e) => setEditingName(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveInlineRename(project.id);
                                                                if (e.key === 'Escape') setEditingProjectId(null);
                                                            }}
                                                            autoFocus
                                                            className="rounded-lg border border-violet-500 bg-[#090a0f] px-2 py-0.5 text-xs text-white focus:outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => saveInlineRename(project.id)}
                                                            className="text-emerald-400 hover:text-emerald-300"
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingProjectId(null)}
                                                            className="text-rose-400 hover:text-rose-300"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="font-semibold text-zinc-100">
                                                        {project.name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Slug */}
                                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-500 hidden sm:table-cell">
                                            {project.slug ? `/${project.slug}` : '—'}
                                        </td>

                                        {/* Telemetry */}
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold"
                                                style={{
                                                    borderColor: `${projectColor}40`,
                                                    backgroundColor: `${projectColor}15`,
                                                    color: projectColor,
                                                }}
                                            >
                                                <Activity className="h-2.5 w-2.5" />
                                                <span>{project.active_count ?? 0} active</span>
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            {project.archived_at ? (
                                                <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-400">
                                                    Archived
                                                </span>
                                            ) : (
                                                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                                                    Active
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        {canManageAreas && (
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={originalIndex === 0}
                                                        onClick={() => moveProject(originalIndex, -1)}
                                                        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={originalIndex === projects.length - 1}
                                                        onClick={() => moveProject(originalIndex, 1)}
                                                        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 bg-[#111216] text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => startInlineRename(project)}
                                                        className="rounded-md border border-zinc-800 bg-[#111216] px-2 py-1 text-[11px] font-medium text-violet-300 hover:border-violet-500/40 hover:bg-violet-500/10 transition-colors"
                                                    >
                                                        Rename
                                                    </button>
                                                    {project.archived_at ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => restoreProject(project)}
                                                            className="rounded-md border border-zinc-800 bg-[#111216] px-2 py-1 text-[11px] font-medium text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                                                        >
                                                            Restore
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => archiveProject(project)}
                                                            className="rounded-md border border-zinc-800 bg-[#111216] px-2 py-1 text-[11px] font-medium text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors"
                                                        >
                                                            Archive
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

