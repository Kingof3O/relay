import Card from '@/Components/Card';
import { WorkspaceProject, WorkspaceUser, WorkRequestDetail } from '@/types/workspace';
import { Sliders, Calendar, Tag, X, Plus, Link2, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface RequestSidebarPropertiesProps {
    request: WorkRequestDetail;
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    canAssign: boolean;
    canEdit: boolean;
    onUpdate: (changes: Record<string, unknown>) => Promise<void> | void;
    onRequestChange?: (newRequest: WorkRequestDetail) => void;
}

export default function RequestSidebarProperties({
    request,
    projects,
    users,
    statuses,
    priorities,
    canAssign,
    canEdit,
    onUpdate,
    onRequestChange,
}: RequestSidebarPropertiesProps) {
    const [tagInput, setTagInput] = useState('');
    const [relationTicketId, setRelationTicketId] = useState('');
    const [relationType, setRelationType] = useState<'blocks' | 'relates_to' | 'duplicate'>('blocks');
    const [linking, setLinking] = useState(false);

    // Tag management
    const currentTags = Array.isArray(request.tags) ? request.tags : [];

    const handleAddTag = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = tagInput.trim().replace(/^#/, '').toLowerCase();
        if (!trimmed) return;
        if (currentTags.includes(trimmed)) {
            toast.error('Tag already added');
            setTagInput('');
            return;
        }

        const newTags = [...currentTags, trimmed];
        setTagInput('');
        await onUpdate({ tags: newTags });
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        const newTags = currentTags.filter((t) => t !== tagToRemove);
        await onUpdate({ tags: newTags });
    };

    // Relation management
    const handleAddRelation = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanedId = parseInt(relationTicketId.replace(/[^0-9]/g, ''), 10);
        if (isNaN(cleanedId) || cleanedId <= 0) {
            toast.error('Enter a valid ticket number (e.g. 42)');
            return;
        }
        if (cleanedId === request.id) {
            toast.error('Cannot link a ticket to itself');
            return;
        }

        setLinking(true);
        try {
            const { data } = await axios.post(route('requests.relations.store', request.id), {
                related_id: cleanedId,
                type: relationType,
            });

            setRelationTicketId('');
            toast.success('Relation linked');
            if (onRequestChange && data.request) {
                onRequestChange(data.request);
            } else {
                router.reload();
            }
        } catch (err: unknown) {
            const msg = isAxiosError(err)
                ? (err.response?.data?.message ?? 'Could not link relation.')
                : 'Could not link relation.';
            toast.error(msg);
        } finally {
            setLinking(false);
        }
    };

    const handleRemoveRelation = async (relationId: number) => {
        try {
            const { data } = await axios.delete(
                route('requests.relations.destroy', [request.id, relationId])
            );
            toast.success('Relation removed');
            if (onRequestChange && data.request) {
                onRequestChange(data.request);
            } else {
                router.reload();
            }
        } catch (err: unknown) {
            const msg = isAxiosError(err)
                ? (err.response?.data?.message ?? 'Could not remove relation.')
                : 'Could not remove relation.';
            toast.error(msg);
        }
    };

    return (
        <aside className="space-y-4">
            {/* Core Properties */}
            <Card className="space-y-4 p-5">
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                    <Sliders className="h-3.5 w-3.5 text-violet-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Properties
                    </h2>
                </div>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Status
                    </span>
                    <select
                        disabled={!canEdit}
                        value={request.status}
                        onChange={(event) => onUpdate({ status: event.target.value })}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        {Object.entries(statuses).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Priority
                    </span>
                    <select
                        disabled={!canEdit}
                        value={request.priority}
                        onChange={(event) => onUpdate({ priority: event.target.value })}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        {Object.entries(priorities).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Project
                    </span>
                    <select
                        disabled={!canEdit}
                        value={request.project?.id ?? ''}
                        onChange={(event) => onUpdate({ area_id: Number(event.target.value) })}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Assignee
                    </span>
                    <select
                        disabled={!canAssign}
                        value={request.assignee?.id ?? ''}
                        onChange={(event) =>
                            onUpdate({
                                assignee_id: event.target.value ? Number(event.target.value) : null,
                            })
                        }
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Due Date Picker Field */}
                <div className="border-t border-white/[0.06] pt-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
                            <Calendar className="h-3 w-3 text-violet-400" />
                            <span>Due Date</span>
                        </span>
                        {request.due_date && (
                            <button
                                type="button"
                                disabled={!canEdit}
                                onClick={() => onUpdate({ due_date: null })}
                                className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="date"
                            disabled={!canEdit}
                            value={request.due_date ?? ''}
                            onChange={(e) => onUpdate({ due_date: e.target.value || null })}
                            className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50 [color-scheme:dark]"
                        />
                    </div>
                    {request.due_date && request.due_human && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <span
                                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                                    request.is_overdue
                                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                                        : request.due_human === 'Due today'
                                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                                        : 'border-zinc-700/50 bg-zinc-800/80 text-zinc-400'
                                }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                        request.is_overdue
                                            ? 'bg-rose-400'
                                            : request.due_human === 'Due today'
                                            ? 'bg-amber-400'
                                            : 'bg-zinc-500'
                                    }`}
                                />
                                <span>{request.due_human}</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Tag Input Chip Manager */}
                <div className="border-t border-white/[0.06] pt-3">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-2">
                        <Tag className="h-3 w-3 text-violet-400" />
                        <span>Tags</span>
                    </span>

                    {/* Chips Display */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {currentTags.length > 0 ? (
                            currentTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[10px] px-2 py-0.5 rounded-md"
                                >
                                    <span>#{tag}</span>
                                    {canEdit && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-zinc-500 hover:text-rose-400 transition-colors ml-0.5"
                                            title="Remove tag"
                                        >
                                            <X className="h-2.5 w-2.5" />
                                        </button>
                                    )}
                                </span>
                            ))
                        ) : (
                            <span className="text-[11px] text-zinc-600">No tags assigned</span>
                        )}
                    </div>

                    {/* Add Tag Input */}
                    {canEdit && (
                        <form onSubmit={handleAddTag} className="flex items-center gap-1.5">
                            <input
                                type="text"
                                placeholder="Add tag (e.g. bug, api)..."
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#07090e] px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                            />
                            <button
                                type="submit"
                                disabled={!tagInput.trim()}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-violet-400 hover:bg-violet-500/10 hover:text-white disabled:opacity-40 transition-colors"
                                title="Add tag"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </form>
                    )}
                </div>
            </Card>

            {/* Dependencies & Relations Section */}
            <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                    <Link2 className="h-3.5 w-3.5 text-violet-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Dependencies & Relations
                    </h2>
                </div>

                {/* List of existing relations */}
                <div className="space-y-2">
                    {request.relations && request.relations.length > 0 ? (
                        request.relations.map((rel) => {
                            const isBlocker = rel.type === 'blocks';
                            return (
                                <div
                                    key={rel.id}
                                    className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#07090e]/80 p-2 text-xs"
                                >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span
                                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 border ${
                                                isBlocker
                                                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                                                    : rel.type === 'duplicate'
                                                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                                                    : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                                            }`}
                                        >
                                            {isBlocker ? 'Blocks' : rel.type === 'duplicate' ? 'Duplicate' : 'Relates'}
                                        </span>
                                        <Link
                                            href={route('requests.show', rel.related_id)}
                                            className="font-mono text-[11px] font-bold text-violet-300 hover:underline shrink-0"
                                        >
                                            #REQ-{rel.related_id}
                                        </Link>
                                        {rel.related?.title && (
                                            <span className="truncate text-zinc-300 text-[11px]" title={rel.related.title}>
                                                {rel.related.title}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {rel.related?.status_label && (
                                            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400">
                                                {rel.related.status_label}
                                            </span>
                                        )}
                                        {canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRelation(rel.id)}
                                                className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                                                title="Unlink relation"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-[11px] text-zinc-600">No linked dependencies or relations.</p>
                    )}
                </div>

                {/* Add Relation Form */}
                {canEdit && (
                    <form onSubmit={handleAddRelation} className="space-y-2 border-t border-white/[0.06] pt-3">
                        <span className="block text-[11px] font-semibold text-zinc-400">
                            Link Relation
                        </span>
                        <div className="flex items-center gap-2">
                            <select
                                value={relationType}
                                onChange={(e) => setRelationType(e.target.value as any)}
                                className="w-28 rounded-lg border border-white/[0.08] bg-[#07090e] px-2 py-1.5 text-xs text-zinc-300 focus:border-violet-500 focus:outline-none"
                            >
                                <option value="blocks">Blocked by</option>
                                <option value="relates_to">Relates to</option>
                                <option value="duplicate">Duplicate of</option>
                            </select>
                            <input
                                type="text"
                                placeholder="#REQ-123 or 123"
                                value={relationTicketId}
                                onChange={(e) => setRelationTicketId(e.target.value)}
                                className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#07090e] px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={linking || !relationTicketId.trim()}
                                className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:border-violet-400 hover:bg-violet-500/10 hover:text-white disabled:opacity-40 transition-colors"
                            >
                                {linking ? 'Linking…' : 'Link'}
                            </button>
                        </div>
                    </form>
                )}
            </Card>

            {/* Blocked Status Callout Panel */}
            <Card className="p-5">
                <label
                    className={`flex items-start gap-3 ${canEdit ? 'cursor-pointer select-none' : ''}`}
                >
                    <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={request.is_blocked}
                        onChange={(event) =>
                            onUpdate({
                                is_blocked: event.target.checked,
                                blocked_reason: event.target.checked ? request.blocked_reason : null,
                            })
                        }
                        className="mt-0.5 h-4 w-4 rounded border-white/10 bg-[#07090e] text-rose-600 focus:ring-0 disabled:opacity-50"
                    />
                    <div>
                        <span className="block text-xs font-bold text-white">Roadblock / Blocked</span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500">
                            Flag this request as blocked and document the blocker reason.
                        </span>
                    </div>
                </label>

                {request.is_blocked && canEdit && (
                    <textarea
                        defaultValue={request.blocked_reason ?? ''}
                        onBlur={(event) => {
                            if (event.target.value !== (request.blocked_reason ?? '')) {
                                onUpdate({ blocked_reason: event.target.value });
                            }
                        }}
                        rows={3}
                        placeholder="Explain why work is blocked…"
                        className="mt-3 w-full rounded-xl border border-rose-500/30 bg-[#07090e] p-2.5 text-xs text-rose-200 placeholder:text-zinc-600 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                )}
            </Card>
        </aside>
    );
}
