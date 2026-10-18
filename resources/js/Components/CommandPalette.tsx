import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
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
    projects?: Array<{ id: number; name: string }>;
}) {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{
        requests: SearchResultItem[];
        projects: ProjectResultItem[];
    }>({ requests: [], projects: [] });
    const [loading, setLoading] = useState(false);

    const pageProps = usePage().props as any;
    const usersList = (pageProps.users as Array<{ id: number; name: string; username: string }>) || [];
    const activeRequest = pageProps.request;
    const pathTicketId = typeof window !== 'undefined' ? window.location.pathname.match(/\/requests\/(\d+)/)?.[1] : null;
    const ticketId = activeRequest?.id ?? (pathTicketId ? parseInt(pathTicketId, 10) : null);

    const robinUser = usersList.find((u) => u.username?.toLowerCase() === 'robin' || u.name?.toLowerCase().includes('robin'));
    const hussienUser = usersList.find((u) => u.username?.toLowerCase() === 'hussien' || u.name?.toLowerCase().includes('hussien'));

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
                const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
                setSearchResults(res.data);
            } catch {
                // Ignore search error silently
            } finally {
                setLoading(false);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [search]);

    if (!open) return null;

    const navigate = (url: string) => {
        setOpen(false);
        router.visit(url);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh] backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setOpen(false)}
        >
            <div
                className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0d1322]/95 shadow-2xl backdrop-blur-2xl shadow-specular animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <Command
                    label="Command Menu"
                    className="flex flex-col"
                    shouldFilter={false}
                >
                    <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5">
                        <Search className="h-4 w-4 shrink-0 text-violet-400" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Type to search tickets or jump to page..."
                            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                            autoFocus
                        />
                        {loading && (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-400" />
                        )}
                        <kbd className="flex h-5 items-center gap-0.5 rounded border border-white/[0.1] bg-white/[0.04] px-1.5 text-[10px] font-mono text-zinc-400">
                            ESC
                        </kbd>
                    </div>

                    <Command.List className="custom-scroll max-h-[360px] overflow-y-auto p-2 text-xs">
                        {/* Matching Search Results: Tickets */}
                        {searchResults.requests.length > 0 && (
                            <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400">Matching Tickets ({searchResults.requests.length})</span>}>
                                {searchResults.requests.map((req) => (
                                    <Command.Item
                                        key={`req-${req.id}`}
                                        value={`REQ-${req.id} ${req.title}`}
                                        onSelect={() => navigate(`/requests/${req.id}`)}
                                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="font-mono text-xs font-bold text-violet-400 shrink-0">
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
                            <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400">Projects ({searchResults.projects.length})</span>}>
                                {searchResults.projects.map((proj) => (
                                    <Command.Item
                                        key={`search-proj-${proj.id}`}
                                        value={`project ${proj.name}`}
                                        onSelect={() => navigate(route('requests.index', { project: String(proj.id) }))}
                                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: proj.color || '#6366f1' }}
                                            />
                                            <span className="font-medium">{proj.name}</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500">Jump to project</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {/* Actionable Linear Command Group */}
                        <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400">{ticketId ? `Ticket Actions (#REQ-${ticketId})` : 'Linear Ticket Actions'}</span>}>
                            <Command.Item
                                value="Assign to Robin"
                                onSelect={() => handleTicketAction({ assignee_id: robinUser?.id || 1 }, 'Assigned to Robin')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                                        <UserCheck className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Assign to Robin</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">A R</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Assign to Hussien"
                                onSelect={() => handleTicketAction({ assignee_id: hussienUser?.id || 2 }, 'Assigned to Hussien')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                                        <UserCheck className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Assign to Hussien</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">A H</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set priority: Urgent"
                                onSelect={() => handleTicketAction({ priority: 'urgent' }, 'Priority set to Urgent')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Set priority: Urgent</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">P 1</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set priority: High"
                                onSelect={() => handleTicketAction({ priority: 'high' }, 'Priority set to High')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Set priority: High</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">P 2</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set priority: Normal"
                                onSelect={() => handleTicketAction({ priority: 'normal' }, 'Priority set to Normal')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Set priority: Normal</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">P 3</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Change status: Doing"
                                onSelect={() => handleTicketAction({ status: 'doing' }, 'Moved to Doing')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                                        <Clock className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Change status: Doing</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">S 1</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Change status: Review"
                                onSelect={() => handleTicketAction({ status: 'review' }, 'Moved to Review')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Change status: Review</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">S 2</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Change status: Done"
                                onSelect={() => handleTicketAction({ status: 'done' }, 'Moved to Done')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Change status: Done</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">S 3</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set due date: Tomorrow"
                                onSelect={() => handleTicketAction({ due_date: getTomorrowStr() }, 'Due date set to Tomorrow')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                                        <Calendar className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Set due date: Tomorrow</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">D T</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Set due date: Next week"
                                onSelect={() => handleTicketAction({ due_date: getNextWeekStr() }, 'Due date set to Next week')}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                                        <Calendar className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Set due date: Next week</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">D W</kbd>
                            </Command.Item>

                            <Command.Item
                                value="Copy ticket link"
                                onSelect={copyTicketLink}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                                        <Copy className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Copy ticket link</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">⌘ ⇧ C</kbd>
                            </Command.Item>

                            <Command.Item
                                value="View Keyboard Shortcuts (?)"
                                onSelect={() => {
                                    setOpen(false);
                                    onOpenShortcuts?.();
                                }}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                                        <Keyboard className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">View Keyboard Shortcuts (?)</span>
                                </div>
                                <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">?</kbd>
                            </Command.Item>
                        </Command.Group>

                        {/* Actions */}
                        <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Actions</span>}>
                            {onOpenCreate && (
                                <Command.Item
                                    onSelect={() => {
                                        setOpen(false);
                                        onOpenCreate();
                                    }}
                                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                                            <Plus className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-semibold">Create New Work Request</span>
                                    </div>
                                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">C</kbd>
                                </Command.Item>
                            )}

                            {onOpenShortcuts && (
                                <Command.Item
                                    onSelect={() => {
                                        setOpen(false);
                                        onOpenShortcuts();
                                    }}
                                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                                            <Keyboard className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-semibold">Keyboard Shortcuts Cheat-sheet</span>
                                    </div>
                                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">?</kbd>
                                </Command.Item>
                            )}

                            <Command.Item
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
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                                        <CheckCheck className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Mark All Notifications as Read</span>
                                </div>
                                <span className="text-[11px] text-zinc-500">Inbox</span>
                            </Command.Item>
                        </Command.Group>

                        {/* Quick Filters */}
                        <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Quick Filters</span>}>
                            <Command.Item
                                onSelect={() => navigate(route('requests.index', { my_work: '1' }))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">My Assigned Tasks</span>
                                </div>
                                <span className="text-[11px] text-zinc-500">Filter work</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate(route('requests.index', { status: 'review' }))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
                                        <Clock className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Review & Sign-Off Queue</span>
                                </div>
                                <span className="text-[11px] text-zinc-500">Pending sign-off</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate(route('requests.index', { priority: 'urgent' }))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                                        <Flame className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-semibold">Urgent Priority Items</span>
                                </div>
                                <span className="text-[11px] text-zinc-500">High priority</span>
                            </Command.Item>
                        </Command.Group>

                        {/* Navigation */}
                        <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Navigation</span>}>
                            <Command.Item
                                onSelect={() => navigate(route('dashboard'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                                    <span>Dashboard / Overview</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate(route('requests.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <KanbanSquare className="h-4 w-4 text-zinc-400" />
                                    <span>Live Kanban Board</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate(route('settings.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Settings className="h-4 w-4 text-zinc-400" />
                                    <span>Settings & Workspaces</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate(route('integrations.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Radio className="h-4 w-4 text-zinc-400" />
                                    <span>Integrations & Webhooks (Discord · Mail)</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate(route('notifications.index'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Bell className="h-4 w-4 text-zinc-400" />
                                    <span>Notifications</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>

                            <Command.Item
                                onSelect={() => navigate(route('profile.edit'))}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                            >
                                <div className="flex items-center gap-2.5">
                                    <User className="h-4 w-4 text-zinc-400" />
                                    <span>Profile & Account</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                            </Command.Item>
                        </Command.Group>

                        {/* Projects from Props */}
                        {projects.length > 0 && searchResults.projects.length === 0 && (
                            <Command.Group heading={<span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Jump to Project</span>}>
                                {projects.map((proj) => (
                                    <Command.Item
                                        key={proj.id}
                                        onSelect={() => navigate(route('requests.index', { project: String(proj.id) }))}
                                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-zinc-300 transition-colors aria-selected:bg-violet-500/15 aria-selected:text-white"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <FolderKanban className="h-3.5 w-3.5 text-indigo-400" />
                                            <span>{proj.name}</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500">View Board</span>
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#07090e]/60 px-4 py-2 text-[11px] text-zinc-500">
                        <div className="flex items-center gap-3">
                            <span>Navigate <kbd className="rounded border border-white/[0.1] px-1 py-0.5 font-mono text-[9px] text-zinc-400">↑↓</kbd></span>
                            <span>Select <kbd className="rounded border border-white/[0.1] px-1 py-0.5 font-mono text-[9px] text-zinc-400">↵</kbd></span>
                        </div>
                        <span className="text-[10px] text-violet-400">Relay Command Studio</span>
                    </div>
                </Command>
            </div>
        </div>
    );
}
