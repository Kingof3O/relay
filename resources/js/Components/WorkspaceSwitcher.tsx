import { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import type { PageProps, Workspace } from '@/types';
import { Check, ChevronsUpDown, Plus, Building2, X } from 'lucide-react';
import Modal from '@/Components/Modal';

interface WorkspaceSwitcherProps {
    collapsed?: boolean;
}

export default function WorkspaceSwitcher({ collapsed = false }: WorkspaceSwitcherProps) {
    const pageProps = usePage<PageProps>().props;
    const currentWorkspace = pageProps.currentWorkspace;
    const userWorkspaces = pageProps.userWorkspaces ?? [];

    const [isOpen, setIsOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const activeWorkspaceName = currentWorkspace?.name ?? 'Relay Studio';
    const activeInitials = (
        currentWorkspace?.name
            ? currentWorkspace.name.trim().split(/\s+/).map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()
            : 'RS'
    );

    const handleSwitch = (workspace: Workspace) => {
        if (workspace.id === currentWorkspace?.id) {
            setIsOpen(false);
            return;
        }

        router.post(
            route('workspaces.switch', workspace.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsOpen(false);
                },
            }
        );
    };

    const handleCreateWorkspace = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) {
            setCreateError('Workspace name is required');
            return;
        }

        setCreating(true);
        setCreateError('');

        router.post(
            route('workspaces.store'),
            { name: newWorkspaceName.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCreating(false);
                    setNewWorkspaceName('');
                    setIsCreateModalOpen(false);
                    setIsOpen(false);
                },
                onError: (errors) => {
                    setCreating(false);
                    setCreateError(errors.name ?? 'Failed to create workspace.');
                },
            }
        );
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Trigger Button (Workspace Card) */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center rounded-xl border border-zinc-800/80 bg-[#090a0f] p-2 transition-all hover:border-zinc-700 hover:bg-[#121318] shadow-sm ${
                    collapsed ? 'justify-center w-10 h-10 p-0' : 'w-full justify-between'
                }`}
                title={collapsed ? activeWorkspaceName : undefined}
                aria-expanded={isOpen}
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    {currentWorkspace?.logo_url ? (
                        <img
                            src={currentWorkspace.logo_url}
                            alt={activeWorkspaceName}
                            className="h-8 w-8 shrink-0 rounded-lg object-cover border border-zinc-750"
                        />
                    ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-750 bg-zinc-850 text-xs font-bold font-mono tracking-tight text-zinc-200 shadow-sm transition-colors group-hover:border-zinc-650 group-hover:text-white">
                            {activeInitials}
                        </div>
                    )}
                    {!collapsed && (
                        <div className="min-w-0 text-left">
                            <div className="truncate text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                {activeWorkspaceName}
                            </div>
                            <div className="truncate text-[10px] font-mono text-zinc-500">
                                {currentWorkspace?.slug ? `@${currentWorkspace.slug}` : 'workspace'}
                            </div>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-zinc-800 bg-[#0c0d12] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Workspaces
                    </div>

                    <div className="max-h-56 space-y-0.5 overflow-y-auto no-scrollbar">
                        {userWorkspaces.length > 0 ? (
                            userWorkspaces.map((ws) => {
                                const isActive = ws.id === currentWorkspace?.id;
                                const wsInitials = ws.name
                                    .trim()
                                    .split(/\s+/)
                                    .map((w: string) => w[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase();

                                return (
                                    <button
                                        key={ws.id}
                                        type="button"
                                        onClick={() => handleSwitch(ws)}
                                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                                            isActive
                                                ? 'bg-zinc-800 text-white font-medium shadow-sm'
                                                : 'text-zinc-300 hover:bg-zinc-850/70 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <div
                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-mono font-bold ${
                                                    isActive
                                                        ? 'border-zinc-650 bg-zinc-700 text-white'
                                                        : 'border-zinc-800 bg-zinc-850 text-zinc-400'
                                                }`}
                                            >
                                                {wsInitials}
                                            </div>
                                            <span className="truncate">{ws.name}</span>
                                        </div>

                                        {isActive && (
                                            <Check className="h-3.5 w-3.5 shrink-0 text-zinc-200" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-2.5 py-2 text-xs text-zinc-500">
                                {activeWorkspaceName}
                            </div>
                        )}
                    </div>

                    <div className="my-1 border-t border-zinc-800/80" />

                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(false);
                            setIsCreateModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-850 hover:text-white"
                    >
                        <Plus className="h-4 w-4 text-zinc-400" />
                        <span>Create Workspace</span>
                    </button>
                </div>
            )}

            {/* Create Workspace Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md">
                <div className="rounded-2xl border border-zinc-800 bg-[#0c0d12] p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-750 bg-zinc-850 text-zinc-200 shadow-sm">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-tight">Create Workspace</h3>
                                <p className="mt-0.5 text-xs text-zinc-400">
                                    Collaborate on requests and projects in an isolated workspace.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850/60 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {createError && (
                        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                            {createError}
                        </div>
                    )}

                    <form onSubmit={handleCreateWorkspace} className="mt-5 space-y-4">
                        <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                Workspace Name <span className="text-rose-400">*</span>
                            </label>
                            <input
                                autoFocus
                                required
                                type="text"
                                placeholder="e.g. Acme Engineering"
                                value={newWorkspaceName}
                                onChange={(e) => setNewWorkspaceName(e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-[#090a0f] px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 shadow-sm transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-zinc-800/80 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={creating}
                                type="submit"
                                className="rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-zinc-950 shadow-sm hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 transition-all"
                            >
                                {creating ? 'Creating...' : 'Create Workspace'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}
