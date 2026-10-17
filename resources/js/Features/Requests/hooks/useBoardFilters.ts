import { useState, useMemo, useEffect } from 'react';
import { WorkRequestCard, WorkspaceUser } from '@/types/workspace';
import { router } from '@inertiajs/react';

export type FilterPreset = 'all' | 'my' | 'review' | 'blocked' | 'urgent';

export interface BoardFilters {
    project?: string;
    owner?: string;
    requester?: string;
    status?: string;
    priority?: string;
    search?: string;
    my_work?: string;
    blocked?: string;
    is_blocked?: string;
    preset?: string;
}

interface UseBoardFiltersOptions {
    requests: WorkRequestCard[];
    filters: BoardFilters;
    authUser?: WorkspaceUser | null;
}

export function useBoardFilters({ requests, filters, authUser }: UseBoardFiltersOptions) {
    const getInitialParams = () => {
        if (typeof window === 'undefined') return new URLSearchParams();
        return new URLSearchParams(window.location.search);
    };

    const initialPreset: FilterPreset = (() => {
        const urlParams = getInitialParams();
        const urlPreset = urlParams.get('preset') as FilterPreset | null;
        if (urlPreset && ['all', 'my', 'review', 'blocked', 'urgent'].includes(urlPreset)) {
            return urlPreset;
        }
        if (filters.my_work === '1' || filters.my_work === 'true') return 'my';
        if (filters.status === 'review') return 'review';
        if (filters.priority === 'urgent') return 'urgent';
        if (filters.blocked === '1' || filters.is_blocked === '1') return 'blocked';
        return 'all';
    })();

    const initialProject = (() => {
        const urlParams = getInitialParams();
        return urlParams.get('project') ?? filters.project ?? '';
    })();

    const initialStatus = (() => {
        const urlParams = getInitialParams();
        return urlParams.get('status') ?? filters.status ?? '';
    })();

    const initialPriority = (() => {
        const urlParams = getInitialParams();
        return urlParams.get('priority') ?? filters.priority ?? '';
    })();

    const initialSearch = (() => {
        const urlParams = getInitialParams();
        return urlParams.get('search') ?? filters.search ?? '';
    })();

    const initialOwner = (() => {
        const urlParams = getInitialParams();
        return urlParams.get('owner') ?? filters.owner ?? '';
    })();

    const initialRequester = (() => {
        const urlParams = getInitialParams();
        return urlParams.get('requester') ?? filters.requester ?? '';
    })();

    const [preset, setPreset] = useState<FilterPreset>(initialPreset);
    const [selectedProject, setSelectedProject] = useState<string>(initialProject);
    const [search, setSearch] = useState<string>(initialSearch);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

    // Advanced filters
    const [owner, setOwner] = useState<string>(initialOwner);
    const [requester, setRequester] = useState<string>(initialRequester);
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
    const [priorityFilter, setPriorityFilter] = useState<string>(initialPriority);

    // Sync active filters with browser URL query parameters without reloading
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);

        if (preset && preset !== 'all') {
            url.searchParams.set('preset', preset);
        } else {
            url.searchParams.delete('preset');
        }

        if (selectedProject) {
            url.searchParams.set('project', selectedProject);
        } else {
            url.searchParams.delete('project');
        }

        if (statusFilter) {
            url.searchParams.set('status', statusFilter);
        } else {
            url.searchParams.delete('status');
        }

        if (priorityFilter) {
            url.searchParams.set('priority', priorityFilter);
        } else {
            url.searchParams.delete('priority');
        }

        if (search) {
            url.searchParams.set('search', search);
        } else {
            url.searchParams.delete('search');
        }

        if (owner) {
            url.searchParams.set('owner', owner);
        } else {
            url.searchParams.delete('owner');
        }

        if (requester) {
            url.searchParams.set('requester', requester);
        } else {
            url.searchParams.delete('requester');
        }

        window.history.replaceState({}, '', url.toString());
    }, [preset, selectedProject, statusFilter, priorityFilter, search, owner, requester]);

    // Preset count computations
    const counts = useMemo(() => {
        const myId = authUser?.id;
        return {
            all: requests.length,
            my: requests.filter((r) => r.assignee?.id === myId).length,
            review: requests.filter((r) => r.status === 'review').length,
            blocked: requests.filter((r) => r.is_blocked).length,
            urgent: requests.filter((r) => r.priority === 'urgent').length,
        };
    }, [requests, authUser]);

    // Filtered requests calculation
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            // Preset logic
            if (preset === 'my' && req.assignee?.id !== authUser?.id) return false;
            if (preset === 'review' && req.status !== 'review') return false;
            if (preset === 'blocked' && !req.is_blocked) return false;
            if (preset === 'urgent' && req.priority !== 'urgent') return false;

            // Project filter
            if (selectedProject && String(req.project?.id) !== selectedProject) return false;

            // Search query
            if (search) {
                const q = search.toLowerCase();
                const matchTitle = req.title.toLowerCase().includes(q);
                const matchDesc = req.description?.toLowerCase().includes(q) ?? false;
                const matchProj = req.project?.name.toLowerCase().includes(q) ?? false;
                const matchUser = req.assignee?.name.toLowerCase().includes(q) ?? false;
                if (!matchTitle && !matchDesc && !matchProj && !matchUser) return false;
            }

            // Advanced filters
            if (owner && String(req.assignee?.id) !== owner) return false;
            if (requester && String(req.requester?.id) !== requester) return false;
            if (statusFilter && req.status !== statusFilter) return false;
            if (priorityFilter && req.priority !== priorityFilter) return false;

            return true;
        });
    }, [requests, preset, selectedProject, search, owner, requester, statusFilter, priorityFilter, authUser]);

    const isFiltered =
        preset !== 'all' ||
        Boolean(selectedProject) ||
        Boolean(search) ||
        Boolean(owner) ||
        Boolean(requester) ||
        Boolean(statusFilter) ||
        Boolean(priorityFilter);

    const resetFilters = () => {
        setPreset('all');
        setSelectedProject('');
        setSearch('');
        setOwner('');
        setRequester('');
        setStatusFilter('');
        setPriorityFilter('');
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.search = '';
            window.history.replaceState({}, '', url.toString());
        }
        router.get(route('requests.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    // Global '/' key listener to focus search filter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === '/' &&
                !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
            ) {
                e.preventDefault();
                document.getElementById('board-search-input')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        preset,
        setPreset,
        selectedProject,
        setSelectedProject,
        search,
        setSearch,
        owner,
        setOwner,
        requester,
        setRequester,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        showAdvancedFilters,
        setShowAdvancedFilters,
        counts,
        filteredRequests,
        isFiltered,
        resetFilters,
    };
}

export type UseBoardFiltersReturn = ReturnType<typeof useBoardFilters>;
