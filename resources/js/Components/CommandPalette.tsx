import { useEffect, useState } from 'react';
import { Command, defaultFilter } from 'cmdk';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    LayoutDashboard,
    KanbanSquare,
    Settings,
    Bell,
    User,
    Plus,
    FolderKanban,
    Flame,
    Clock,
    Search,
    ArrowRight,
    Keyboard,
    CheckCheck,
    Loader2,
    Calendar,
    Copy,
    UserCheck,
    CheckCircle2,
    Radio,
} from 'lucide-react';

interface SearchResultItem {
    id: number;
    title: string;
    status: string;
    priority: string;
    project?: { id: number; name: string; color?: string | null } | null;
}

interface ProjectResultItem {
    id: number;
    name: string;
    color?: string | null;
}

export default function CommandPalette({
    open,
    setOpen,
    onOpenCreate,
    onOpenShortcuts,
    projects = [],
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    onOpenCreate?: () => void;
    onOpenShortcuts?: () => void;
    projects?: Array<{ id: number; name: string; color?: string | null }>;
}) {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{
        requests: SearchResultItem[];
        projects: ProjectResultItem[];
    }>({ requests: [], projects: [] });
    const [loading, setLoading] = useState(false);

    const pageProps = usePage().props as any;
    const usersList = (pageProps.users as Array<{ id: number; name: string; username: string }>) || [];
    const availableProjects: Array<{ id: number; name: string; color?: string | null }> =
        (projects && projects.length > 0) ? projects : (pageProps.workspaceProjects ?? pageProps.projects ?? []);
    const activeRequest = pageProps.request;
    const pathTicketId = typeof window !== 'undefined' ? window.location.pathname.match(/\/requests\/(\d+)/)?.[1] : null;
    const ticketId = activeRequest?.id ?? (pathTicketId ? parseInt(pathTicketId, 10) : null);

    const filterCommand = (value: string, searchStr: string, keywords?: string[]) => {
        if (value.startsWith('server:')) {
            return 1;
        }
        return defaultFilter(value, searchStr, keywords);
    };

    const handleTicketAction = async (payload: Record<string, unknown>, successMsg: string) => {
        setOpen(false);
        if (!ticketId) {
            toast.info('Open a ticket to execute ticket actions');
            router.visit(route('requests.index'));
            return;
        }

        try {
            await axios.patch(route('requests.update', ticketId), payload);
            toast.success(successMsg);
            router.reload();
        } catch {
            toast.error(`Failed: ${successMsg}`);
        }
    };

    const getTomorrowStr = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const getNextWeekStr = () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split('T')[0];
    };

    const copyTicketLink = () => {
        setOpen(false);
        const url = ticketId ? `${window.location.origin}/requests/${ticketId}` : window.location.href;
        navigator.clipboard.writeText(url);
        toast.success('Ticket link copied to clipboard');
    };

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (
                (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
                (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))
            ) {
                e.preventDefault();
                setOpen(!open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, setOpen]);

    // Debounced global search
    useEffect(() => {
        const query = search.trim();
        if (!query) {
            setSearchResults({ requests: [], projects: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const searchUrl = (typeof route === 'function' && route().has('search')) ? route('search') : '/search';
                const res = await axios.get(searchUrl, {
                    params: { q: query },
                    headers: { Accept: 'application/json' },
                });
                if (res.data && typeof res.data === 'object' && Array.isArray(res.data.requests)) {
                    setSearchResults(res.data);
                } else {
                    setSearchResults({ requests: [], projects: [] });
                }
            } catch {
                try {
                    const res2 = await axios.get('/api/search', {
                        params: { q: query },
                        headers: { Accept: 'application/json' },
                    });
                    if (res2.data && typeof res2.data === 'object' && Array.isArray(res2.data.requests)) {
                        setSearchResults(res2.data);
                    } else {
                        setSearchResults({ requests: [], projects: [] });
                    }
                } catch {
                    setSearchResults({ requests: [], projects: [] });
                }
            } finally {
                setLoading(false);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!open) {
            setSearch('');
            setSearchResults({ requests: [], projects: [] });
        }
    }, [open]);

    if (!open) return null;

    const navigate = (url: string) => {
        setOpen(false);
        router.visit(url);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-[12vh] sm:pt-[15vh] backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setOpen(false)}
        >
            <div
                className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0d12]/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] shadow-specular backdrop-blur-2xl ring-1 ring-white/[0.05] animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top specular highlight reflection */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    aria-hidden="true"
                />

                <Command
                    label="Command Menu"
                    className="flex flex-col"
                    filter={filterCommand}
                >
                    <div className="flex items-center gap-3 border-b border-zinc-800/80 bg-[#090a0f]/80 px-4 py-3.5">
                        <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Type to search tickets or jump to page..."
                            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent p-0 shadow-none"
                            autoFocus
                        />
                        {loading && (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-400" />
                        )}
                        <kbd className="flex h-5 items-center gap-0.5 rounded-md border border-zinc-750 bg-zinc-850 px-1.5 text-[10px] font-mono text-zinc-400 shadow-sm">
                            ESC
                        </kbd>
                    </div>

                    <Command.List className="custom-scroll max-h-[380px] overflow-y-auto p-2 text-xs">
                        {/* Matching Search Results: Tickets */}
                        {searchResults.requests.length > 0 && (
                            <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Matching Tickets ({searchResults.requests.length})</span>}>
                                {searchResults.requests.map((req) => (
                                    <Command.Item
                                        key={`req-${req.id}`}
                                        value={`server:req-${req.id} #${req.id} REQ-${req.id} ${req.title}`}
                                        keywords={['ticket', 'request', String(req.id), `REQ-${req.id}`, `#${req.id}`, req.title, req.project?.name || '']}
                                        onSelect={() => navigate(`/requests/${req.id}`)}
                                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="font-mono text-xs font-semibold text-zinc-300 shrink-0">
                                                #REQ-{req.id}
                                            </span>
                                            <span
                                                className={`h-2 w-2 rounded-full shrink-0 ${
                                                    req.priority === 'urgent'
                                                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                                                        : req.priority === 'high'
                                                        ? 'bg-amber-400'
                                                        : req.priority === 'low'
                                                        ? 'bg-zinc-500'
                                                        : 'bg-zinc-400'
                                                }`}
                                                title={`Priority: ${req.priority}`}
                                            />
                                            <span className="truncate text-xs font-medium text-zinc-200">
                                                {req.title}
                                            </span>
                                        </div>
                                        {req.project && (
                                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                <span
                                                    className="h-2 w-2 rounded-full"
                                                    style={{ backgroundColor: req.project.color || '#8b5cf6' }}
                                                />
                                                <span className="text-[10px] text-zinc-400 font-medium">
                                                    {req.project.name}
                                                </span>
                                            </div>
                                        )}
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Matching Search Results: Projects */}
                        {searchResults.projects.length > 0 && (
                            <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Projects ({searchResults.projects.length})</span>}>
                                {searchResults.projects.map((proj) => (
                                    <Command.Item
                                        key={`search-proj-${proj.id}`}
                                        value={`server:proj-${proj.id} project ${proj.name}`}
                                        keywords={['project', 'projects', proj.name]}
                                        onSelect={() => navigate(route('requests.index', { project: String(proj.id) }))}
                                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: proj.color || '#6366f1' }}
                                            />
                                            <span className="font-medium text-zinc-200">{proj.name}</span>
                                        </div>
                                        <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">Jump to project</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Actionable Linear Command Group (Visible when a ticket is open) */}
                        {Boolean(ticketId) && (
                            <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{`Ticket Actions (#REQ-${ticketId})`}</span>}>
                            {usersList.slice(0, 4).map((member) => (
                                <Command.Item
                                    key={`assign-${member.id}`}
                                    value={`Assign to ${member.name || member.username}`}
                                    keywords={['assign', member.name, member.username]}
                                    onSelect={() => handleTicketAction({ assignee_id: member.id }, `Assigned to ${member.name || member.username}`)}
                                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                            <UserCheck className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-medium text-zinc-200">Assign to {member.name || member.username}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-400">{member.username ? `@${member.username}` : ''}</span>
                                </Command.Item>
                            ))}

                            <Command.Item
                                value="Unassign ticket"
                                keywords={['unassign', 'remove', 'assignee']}
                                onSelect={() => handleTicketAction({ assignee_id: null }, 'Unassigned ticket')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <UserCheck className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Unassign ticket</span>
                                </div>
                                <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">None</span>
                            </Command.Item>

                            <Command.Item
                                value="Set priority: Urgent"
                                keywords={['priority', 'urgent', 'p1']}
                                onSelect={() => handleTicketAction({ priority: 'urgent' }, 'Priority set to Urgent')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-rose-400 shadow-sm">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Set priority: Urgent</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">P 1</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set priority: High"
                                keywords={['priority', 'high', 'p2']}
                                onSelect={() => handleTicketAction({ priority: 'high' }, 'Priority set to High')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-amber-400 shadow-sm">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Set priority: High</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">P 2</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set priority: Normal"
                                keywords={['priority', 'normal', 'p3']}
                                onSelect={() => handleTicketAction({ priority: 'normal' }, 'Priority set to Normal')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Set priority: Normal</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">P 3</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Change status: Doing"
                                keywords={['status', 'doing', 'in progress', 's1']}
                                onSelect={() => handleTicketAction({ status: 'doing' }, 'Moved to Doing')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-amber-400 shadow-sm">
                                        <Clock className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Change status: Doing</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">S 1</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Change status: Review"
                                keywords={['status', 'review', 's2']}
                                onSelect={() => handleTicketAction({ status: 'review' }, 'Moved to Review')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-purple-400 shadow-sm">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Change status: Review</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">S 2</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Change status: Done"
                                keywords={['status', 'done', 'completed', 's3']}
                                onSelect={() => handleTicketAction({ status: 'done' }, 'Moved to Done')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-emerald-400 shadow-sm">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Change status: Done</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">S 3</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set due date: Tomorrow"
                                keywords={['due', 'date', 'tomorrow']}
                                onSelect={() => handleTicketAction({ due_date: getTomorrowStr() }, 'Due date set to Tomorrow')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Set due date: Tomorrow</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">D T</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set due date: Next week"
                                keywords={['due', 'date', 'next week']}
                                onSelect={() => handleTicketAction({ due_date: getNextWeekStr() }, 'Due date set to Next week')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Set due date: Next week</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">D W</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Copy ticket link"
                                keywords={['copy', 'ticket', 'link', 'share']}
                                onSelect={copyTicketLink}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <Copy className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Copy ticket link</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">⌘ ⇧ C</kbd>
                            </Command.Item>

                            <Command.Item
                                value="View Keyboard Shortcuts (?)"
                                keywords={['keyboard', 'shortcuts', 'help', '?']}
                                onSelect={() => {
                                    setOpen(false);
                                    onOpenShortcuts?.();
                                }}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <Keyboard className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">View Keyboard Shortcuts (?)</span>
                                </div>
                                <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">?</kbd>
                            </Command.Item>
                        </Command.Group>
                    )}

                        {/* Actions */}
                        <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Actions</span>}>
                            {onOpenCreate && (
                                <Command.Item
                                    value="Create New Work Request ticket issue task"
                                    keywords={['create', 'new', 'work', 'request', 'ticket', 'issue', 'task', 'add', 'c']}
                                    onSelect={() => {
                                        setOpen(false);
                                        onOpenCreate();
                                    }}
                                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                            <Plus className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-medium text-zinc-200">Create New Work Request</span>
                                    </div>
                                    <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">C</kbd>
                                </Command.Item>
                            )}

                            <Command.Item
                                value="Create New Project area initiative settings"
                                keywords={['create', 'new', 'project', 'projects', 'area', 'initiative', 'settings']}
                                onSelect={() => navigate(route('settings.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <FolderKanban className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Create New Project</span>
                                </div>
                                <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">Settings</span>
                            </Command.Item>

                            {onOpenShortcuts && (
                                <Command.Item
                                    value="Keyboard Shortcuts Cheat-sheet help keys"
                                    keywords={['keyboard', 'shortcuts', 'cheat-sheet', 'help', 'hotkeys', 'keys', '?']}
                                    onSelect={() => {
                                        setOpen(false);
                                        onOpenShortcuts();
                                    }}
                                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                            <Keyboard className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-medium text-zinc-200">Keyboard Shortcuts Cheat-sheet</span>
                                    </div>
                                    <kbd className="rounded-md border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">?</kbd>
                                </Command.Item>
                            )}

                            <Command.Item
                                value="Mark All Notifications as Read inbox clear"
                                keywords={['mark', 'all', 'notifications', 'read', 'inbox', 'clear']}
                                onSelect={async () => {
                                    setOpen(false);
                                    try {
                                        await axios.post(route('notifications.read-all'));
                                        toast.success('All notifications marked as read');
                                        router.reload();
                                    } catch {
                                        toast.error('Failed to mark notifications as read');
                                    }
                                }}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <CheckCheck className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Mark All Notifications as Read</span>
                                </div>
                                <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">Inbox</span>
                            </Command.Item>
                        </Command.Group>

                        {/* Quick Filters */}
                        <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Quick Filters</span>}>
                            <Command.Item
                                value="My Assigned Tasks filter work mine tickets"
                                keywords={['my', 'assigned', 'tasks', 'tickets', 'mine', 'filter', 'work']}
                                onSelect={() => navigate(route('requests.index', { my_work: '1' }))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">My Assigned Tasks</span>
                                </div>
                                <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">Filter work</span>
                            </Command.Item>

                            <Command.Item
                                value="Review & Sign-Off Queue pending approval review"
                                keywords={['review', 'sign-off', 'queue', 'pending', 'approval']}
                                onSelect={() => navigate(route('requests.index', { status: 'review' }))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                        <Clock className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Review & Sign-Off Queue</span>
                                </div>
                                <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">Pending sign-off</span>
                            </Command.Item>

                            <Command.Item
                                value="Urgent Priority Items high priority flame critical"
                                keywords={['urgent', 'priority', 'items', 'high', 'critical', 'flame']}
                                onSelect={() => navigate(route('requests.index', { priority: 'urgent' }))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-rose-400 shadow-sm">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Urgent Priority Items</span>
                                </div>
                                <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400">High priority</span>
                            </Command.Item>
                        </Command.Group>

                        {/* Navigation */}
                        <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Navigation</span>}>
                            <Command.Item
                                value="Dashboard Overview home metrics stats"
                                keywords={['dashboard', 'overview', 'home', 'stats', 'metrics']}
                                onSelect={() => navigate(route('dashboard'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Dashboard / Overview</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                value="Live Kanban Board requests tickets issues tasks"
                                keywords={['kanban', 'board', 'requests', 'tickets', 'issues', 'tasks']}
                                onSelect={() => navigate(route('requests.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <KanbanSquare className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Live Kanban Board</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                value="Settings & Workspaces team config members roles"
                                keywords={['settings', 'workspaces', 'config', 'team', 'members', 'roles']}
                                onSelect={() => navigate(route('settings.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <Settings className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Settings & Workspaces</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                value="Integrations & Webhooks Discord GitHub Mail email connect"
                                keywords={['integrations', 'webhooks', 'discord', 'github', 'mail', 'email']}
                                onSelect={() => navigate(route('integrations.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <Radio className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Integrations & Webhooks (Discord · Mail)</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                value="Notifications alerts inbox unread"
                                keywords={['notifications', 'alerts', 'inbox', 'unread']}
                                onSelect={() => navigate(route('notifications.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <Bell className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Notifications</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                value="Profile & Account user password 2fa security"
                                keywords={['profile', 'account', 'user', 'password', '2fa', 'security']}
                                onSelect={() => navigate(route('profile.edit'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-400 shadow-sm">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-medium text-zinc-200">Profile & Account</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>
                        </Command.Group>

                        {/* Projects from Props / Workspace */}
                        {availableProjects.length > 0 && searchResults.projects.length === 0 && (
                            <Command.Group heading={<span className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Jump to Project</span>}>
                                {availableProjects.map((proj) => (
                                    <Command.Item
                                        key={`avail-proj-${proj.id}`}
                                        value={`project ${proj.name}`}
                                        keywords={['project', 'projects', 'jump', 'view', 'board', proj.name]}
                                        onSelect={() => navigate(route('requests.index', { project: String(proj.id) }))}
                                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-zinc-800/70 aria-selected:text-white hover:bg-zinc-800/40"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-[#121318] text-zinc-300 shadow-sm">
                                                <FolderKanban className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="font-medium text-zinc-200">{proj.name}</span>
                                        </div>
                                        <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-[10px] font-mono text-zinc-400">View Board</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Empty State when no results found */}
                        <Command.Empty className="py-12 text-center">
                            <Search className="mx-auto h-5 w-5 text-zinc-600 mb-2.5" />
                            <p className="text-sm font-medium text-zinc-300">No results found for &ldquo;{search.trim()}&rdquo;</p>
                            <p className="text-xs text-zinc-400 mt-1">Try searching by ticket ID (#101), title, project name, or command</p>
                        </Command.Empty>
                    </Command.List>

                    <div className="flex items-center justify-between border-t border-zinc-800/80 bg-[#090a0f]/80 px-4 py-2.5 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-3">
                            <span>Navigate <kbd className="rounded border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">↑↓</kbd></span>
                            <span>Select <kbd className="rounded border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">↵</kbd></span>
                        </div>
                        <span className="font-mono text-[10px] text-zinc-400 font-medium">Relay Command Studio</span>
                    </div>
                </Command>
            </div>
        </div>
    );
}
