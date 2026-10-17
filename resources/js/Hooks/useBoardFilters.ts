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
}

interface UseBoardFiltersOptions {
    requests: WorkRequestCard[];
    filters: BoardFilters;
    authUser?: WorkspaceUser | { id: number; [key: string]: any } | null;
}

export function useBoardFilters({ requests, filters, authUser }: UseBoardFiltersOptions) {
    const initialPreset: FilterPreset =
        filters.my_work === '1' || filters.my_work === 'true'
            ? 'my'
            : filters.status === 'review'
            ? 'review'
            : filters.priority === 'urgent'
            ? 'urgent'
            : filters.blocked === '1' || filters.is_blocked === '1'
            ? 'blocked'
            : 'all';

    const [preset, setPreset] = useState<FilterPreset>(initialPreset);
    const [selectedProject, setSelectedProject] = useState<string>(filters.project ?? '');
    const [search, setSearch] = useState<string>(filters.search ?? '');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

    // Advanced filters
    const [owner, setOwner] = useState<string>(filters.owner ?? '');
    const [requester, setRequester] = useState<string>(filters.requester ?? '');
    const [statusFilter, setStatusFilter] = useState<string>(filters.status ?? '');
    const [priorityFilter, setPriorityFilter] = useState<string>(filters.priority ?? '');

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
