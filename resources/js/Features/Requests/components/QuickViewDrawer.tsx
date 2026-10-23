import { useState, useEffect, FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import StatusBadge from '@/Components/StatusBadge';
import PriorityBadge from '@/Components/PriorityBadge';
import MarkdownViewer from '@/Components/MarkdownViewer';
import ImageLightbox from '@/Components/ImageLightbox';
import FileDropZone from './FileDropZone';
import {
    WorkRequestCard,
    WorkspaceProject,
    WorkspaceUser,
    RequestFileItem,
    RequestActivityItem,
} from '@/types';
import {
    X,
    Maximize2,
    Copy,
    Check,
    Send,
    Paperclip,
    AlertTriangle,
    UploadCloud,
    MessageSquare,
    User as UserIcon,
    Calendar,
    ChevronDown,
} from 'lucide-react';

interface QuickViewDrawerProps {
    requestId: number | null;
    initialRequest?: WorkRequestCard | null;
    onClose: () => void;
    onUpdated?: (updated: WorkRequestCard) => void;
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
}

type DrawerRequest = WorkRequestCard & {
    area_id?: number | null;
    assignee_id?: number | null;
    files?: RequestFileItem[];
    comments?: RequestActivityItem[];
};

export default function QuickViewDrawer({
    requestId,
    initialRequest,
    onClose,
    onUpdated,
    projects,
    users,
    statuses,
    priorities,
}: QuickViewDrawerProps) {
    const [request, setRequest] = useState<DrawerRequest | null>(
        initialRequest && initialRequest.id === requestId ? (initialRequest as DrawerRequest) : null
    );
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [descriptionDraft, setDescriptionDraft] = useState('');

    // Fetch full request details when opened
    useEffect(() => {
        if (!requestId) {
            setRequest(null);
            setDescriptionDraft('');
            return;
        }

        // Immediately seed from initialRequest if available to prevent any blank flash
        if (initialRequest && initialRequest.id === requestId) {
            setRequest((prev) => (prev?.id === requestId ? prev : (initialRequest as DrawerRequest)));
            setDescriptionDraft(initialRequest.description ?? '');
        }

        let isMounted = true;
        setLoading(true);

        axios
            .get(route('requests.show', requestId), { headers: { Accept: 'application/json' } })
            .then((res) => {
                if (isMounted) {
                    const data =
                        res.data?.request ??
                        res.data?.props?.request ??
                        (typeof res.data === 'object' && res.data !== null ? res.data : null);

                    if (data && typeof data === 'object' && 'id' in data) {
                        setRequest(data as DrawerRequest);
                        setDescriptionDraft(data.description ?? '');
                    }
                }
            })
            .catch(() => {
                // If direct JSON isn't returned, fallback to minimal state
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [requestId, initialRequest]);

    // Handle Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/requests/${requestId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePatch = async (changes: Record<string, unknown>) => {
        if (!request) return;
        setSaving(true);
        try {
            const res = await axios.patch(route('requests.update', request.id), changes);
            const updated = res.data.request ?? { ...request, ...changes };
            setRequest(updated);
            if (onUpdated) onUpdated(updated);
            toast.success('Updated');
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveDescription = async () => {
        setIsEditingDescription(false);
        if (request && descriptionDraft !== request.description) {
            await handlePatch({ description: descriptionDraft });
        }
    };

    const handleToggleChecklist = async (updatedMarkdown: string) => {
        setDescriptionDraft(updatedMarkdown);
        await handlePatch({ description: updatedMarkdown });
    };

    const uploadFiles = async (files: File[]) => {
        if (!files.length || !request) return;
        setSaving(true);
        const formData = new FormData();
        files.forEach((file) => formData.append('files[]', file));
        try {
            const res = await axios.post(route('requests.files.store', request.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const updated = res.data.request ?? {
                ...request,
                files: [...(request.files ?? []), ...(res.data.files ?? [])],
            };
            setRequest(updated);
            if (onUpdated) onUpdated(updated);
            toast.success(`Uploaded ${files.length} file(s)`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Could not upload files');
        } finally {
            setSaving(false);
        }
    };

    // Clipboard image paste listener (⌘V)
    useEffect(() => {
        if (!request) return;
        const handlePaste = (e: ClipboardEvent) => {
            const files = Array.from(e.clipboardData?.files ?? []);
            if (files.length > 0) {
                e.preventDefault();
                uploadFiles(files);
                toast.info('Uploading pasted image from clipboard...');
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [request]);

    const handleAddComment = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !request) return;

        setSaving(true);
        try {
            const res = await axios.post(route('requests.comments.store', request.id), {
                body: newComment,
            });
            const updated = res.data.request ?? request;
            setRequest(updated);
            setNewComment('');
            toast.success('Comment added');
        } catch {
            toast.error('Could not post comment');
        } finally {
            setSaving(false);
        }
    };

    if (!requestId) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-xl bg-[#0e1015] border-l border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
                    {/* Top Action Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4 bg-zinc-900/40 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-mono font-medium text-zinc-400">#{requestId}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="truncate text-xs text-zinc-400 font-medium">
                                {request?.project?.name ?? 'No Project'}
                            </span>
                            {request && (
                                <div className="hidden sm:flex items-center gap-1.5 ml-1">
                                    <StatusBadge status={request.status} className="text-[10px]" />
                                    <PriorityBadge priority={request.priority} className="text-[10px]" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                title="Copy direct link"
                            >
                                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </button>

                            <Link
                                href={route('requests.show', requestId)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                title="Open full page"
                            >
                                <Maximize2 className="h-4 w-4" />
                            </Link>

                            <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                                title="Close (Esc)"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Drawer Content with File Drop Zone */}
                    <FileDropZone
                        onFilesDropped={uploadFiles}
                        label="Drop files to attach to this request"
                        className="flex-1 flex flex-col min-h-0 overflow-hidden"
                    >
                        <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6">
                        {loading && !request ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-7 w-3/4 rounded-lg bg-zinc-800/60" />
                                <div className="h-20 w-full rounded-xl bg-zinc-800/40" />
                                <div className="h-32 w-full rounded-xl bg-zinc-800/40" />
                            </div>
                        ) : request ? (
                            <>
                                {/* Status & Priority Properties Bar */}
                                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-zinc-800/80 bg-[#121318]/60">
                                    {/* Status Selector */}
                                    <div>
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                                            Status
                                        </label>
                                        <select
                                            value={request.status}
                                            onChange={(e) => handlePatch({ status: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0"
                                        >
                                            {Object.entries(statuses).map(([val, label]) => (
                                                <option key={val} value={val}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority Selector */}
                                    <div>
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                                            Priority
                                        </label>
                                        <select
                                            value={request.priority}
                                            onChange={(e) => handlePatch({ priority: e.target.value })}
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0"
                                        >
                                            {Object.entries(priorities).map(([val, label]) => (
                                                <option key={val} value={val}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Assignee Selector */}
                                    <div>
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                                            Assignee
                                        </label>
                                        <select
                                            value={request.assignee_id ?? ''}
                                            onChange={(e) =>
                                                handlePatch({
                                                    assignee_id: e.target.value ? Number(e.target.value) : null,
                                                })
                                            }
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0"
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Project Selector */}
                                    <div>
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                                            Project
                                        </label>
                                        <select
                                            value={request.area_id ?? ''}
                                            onChange={(e) =>
                                                handlePatch({
                                                    area_id: e.target.value ? Number(e.target.value) : null,
                                                })
                                            }
                                            className="w-full rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-xs font-medium text-zinc-200 focus:border-zinc-500 focus:ring-0"
                                        >
                                            <option value="">No Project</option>
                                            {projects.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Blocked Notice (if blocked) */}
                                {request.is_blocked && (
                                    <div className="flex items-start gap-2.5 rounded-xl border border-rose-900/50 bg-rose-950/20 p-3 text-xs text-rose-300">
                                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-rose-200">Task Blocked</p>
                                            <p className="mt-0.5 text-zinc-400">{request.blocked_reason || 'Work is blocked.'}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                                        {request.title}
                                    </h2>
                                </div>

                                {/* Description & Interactive Checklist */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-zinc-300">Description & Tasks</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isEditingDescription) handleSaveDescription();
                                                else setIsEditingDescription(true);
                                            }}
                                            className="text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
                                        >
                                            {isEditingDescription ? 'Done' : 'Edit text'}
                                        </button>
                                    </div>

                                    {isEditingDescription ? (
                                        <div className="space-y-2">
                                            <textarea
                                                rows={5}
                                                value={descriptionDraft}
                                                onChange={(e) => setDescriptionDraft(e.target.value)}
                                                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-3 text-xs text-zinc-200 focus:border-zinc-500 focus:ring-0 font-sans"
                                                placeholder="Add Markdown description or checklist tasks with '- [ ] Task name'..."
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditingDescription(false)}
                                                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleSaveDescription}
                                                    className="rounded-lg bg-zinc-800 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700"
                                                >
                                                    Save Description
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-zinc-800 bg-[#121318]/50 p-3.5">
                                            {request.description ? (
                                                <MarkdownViewer
                                                    content={request.description}
                                                    onToggleChecklist={handleToggleChecklist}
                                                />
                                            ) : (
                                                <p
                                                    onClick={() => setIsEditingDescription(true)}
                                                    className="text-xs text-zinc-500 italic cursor-pointer hover:text-zinc-400"
                                                >
                                                    No description. Click to add details or interactive checklists...
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Attachments Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-zinc-300">
                                            Attachments ({request.files?.length ?? 0})
                                        </span>
                                        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-850 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                                            <UploadCloud className="h-3 w-3 text-violet-400" />
                                            <span>+ Add Files</span>
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
                                            />
                                        </label>
                                    </div>

                                    {request.files && request.files.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {request.files.map((file: RequestFileItem) => {
                                                const isImage = file.mime_type?.startsWith('image/');
                                                return (
                                                    <div
                                                        key={file.id}
                                                        onClick={() => isImage && file.url && setLightboxSrc(file.url)}
                                                        className={`group relative rounded-lg border border-zinc-800 bg-zinc-850 overflow-hidden p-2 text-left transition-colors hover:border-zinc-700 ${
                                                            isImage ? 'cursor-pointer' : ''
                                                        }`}
                                                    >
                                                        {isImage ? (
                                                            <div className="h-16 w-full rounded bg-zinc-900 mb-1.5 overflow-hidden">
                                                                <img
                                                                    src={file.url || ''}
                                                                    alt={file.original_name}
                                                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-150"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="h-16 w-full rounded bg-zinc-900 mb-1.5 flex items-center justify-center text-zinc-500">
                                                                <Paperclip className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                        <p className="truncate text-[10px] font-medium text-zinc-300">
                                                            {file.original_name}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed border-zinc-800 bg-[#121318]/40 p-3 text-center">
                                            <p className="text-[11px] text-zinc-500">No attachments. Drag files or paste images (⌘V) here.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Comments Stream */}
                                <div className="space-y-3 pt-2 border-t border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                                        <span className="text-xs font-semibold text-zinc-300">Comments & Activity</span>
                                    </div>

                                    {request.comments && request.comments.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {request.comments.map((c: RequestActivityItem) => (
                                                <div
                                                    key={c.id}
                                                    className="rounded-xl border border-zinc-850 bg-[#121318]/70 p-3 text-xs"
                                                >
                                                    <div className="flex items-center justify-between text-[11px] mb-1">
                                                        <span className="font-semibold text-zinc-200">
                                                            {c.user?.name ?? 'User'}
                                                        </span>
                                                        <span className="text-zinc-500 font-mono">
                                                            {c.created_at ? new Date(c.created_at).toLocaleDateString([], {
                                                                month: 'short',
                                                                day: 'numeric',
                                                            }) : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                                        {c.body}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-zinc-500 italic">No comments yet.</p>
                                    )}

                                    {/* Quick Comment Input */}
                                    <form onSubmit={handleAddComment} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:border-zinc-500 focus:ring-0"
                                        />
                                        <button
                                            type="submit"
                                            disabled={saving || !newComment.trim()}
                                            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-zinc-500">Request not found.</p>
                        )}
                    </div>
                    </FileDropZone>
                </div>
            </div>

            {/* Lightbox Modal */}
            <ImageLightbox
                src={lightboxSrc}
                onClose={() => setLightboxSrc(null)}
            />
        </div>
    );
}
