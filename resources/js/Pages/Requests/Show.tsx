import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import ImageLightbox from '@/Components/ImageLightbox';
import LivePresenceAvatars from '@/Components/LivePresenceAvatars';
import ConfirmDialog from '@/Components/ConfirmDialog';
import {
    RequestHeroHeader,
    RequestBlockerBanner,
    RequestDescriptionCard,
    RequestSubtasksSection,
    RequestPullRequestsSection,
    RequestMediaGallery,
    RequestDiscussionSection,
    RequestSidebarProperties,
} from '@/Features/Requests';
import { triggerConfetti } from '@/Utils/confetti';
import { PageProps } from '@/types';
import { WorkspaceProject, WorkspaceUser, WorkRequestDetail, WorkRequestCard, RequestActivityItem } from '@/types/workspace';
import axios, { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type ShowProps = PageProps<{
    request: WorkRequestDetail;
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    cycles?: Array<{ id: number; number: number; name: string; is_active?: boolean }>;
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    canAssign: boolean;
    canEdit: boolean;
    canComment: boolean;
    canUpload: boolean;
    canDelete: boolean;
}>;

interface WorkRequestCommentedBroadcast {
    request_id: number;
    activity_id: number;
    body: string;
    actor_id?: number | null;
    request?: WorkRequestDetail;
    created_at?: string;
}

interface SubtaskUpdatedBroadcast {
    parent_id: number;
    subtask_id: number;
    action: 'created' | 'toggled' | 'deleted';
    actor_id?: number | null;
    subtask?: WorkRequestCard;
    parent_request?: WorkRequestDetail;
}

interface WorkRequestMovedBroadcast {
    request_id: number;
    actor_id?: number | null;
    from_status?: string | null;
    to_status?: string | null;
    status: string;
    request?: WorkRequestCard;
}

interface WorkRequestDeletedBroadcast {
    request_id: number;
    workspace_id: number;
    actor_id?: number | null;
}

export default function Show({
    auth,
    request: initialRequest,
    projects,
    users,
    cycles = [],
    statuses,
    priorities,
    canAssign,
    canEdit,
    canComment,
    canUpload,
    canDelete,
}: ShowProps) {
    const [request, setRequest] = useState(initialRequest);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conflict, setConflict] = useState<{ message: string; showDiff?: boolean } | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const currentUserId = auth?.user?.id;

    const update = async (changes: Record<string, unknown>) => {
        setSaving(true);
        setError(null);
        setConflict(null);
        try {
            const payload = {
                ...changes,
                ...(request.lock_version !== undefined ? { lock_version: request.lock_version } : {}),
            };
            const { data } = await axios.patch(route('requests.update', request.id), payload);
            setRequest(data.request);
            if (changes.status === 'done') triggerConfetti();
            toast.success('Request updated');
        } catch (err: unknown) {
            if (isAxiosError(err) && err.response?.status === 409) {
                const conflictMsg = err.response.data?.message || 'This request has been updated by another teammate.';
                setConflict({ message: conflictMsg });
                toast.error(conflictMsg);
            } else {
                const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not save this change.') : 'Could not save this change.';
                setError(msg);
                toast.error(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    const addComment = async (body: string) => {
        if (!body.trim()) return;
        setSaving(true);
        try {
            const { data } = await axios.post(route('requests.comments.store', request.id), { body });
            setRequest(data.request);
            toast.success('Comment posted');
        } catch (err: unknown) {
            const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not add the comment.') : 'Could not add the comment.';
            setError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const uploadFiles = async (files: File[]) => {
        if (!files.length) return;
        setUploading(true);
        setError(null);
        const formData = new FormData();
        files.forEach((f) => formData.append('files[]', f));
        try {
            const { data } = await axios.post(route('requests.files.store', request.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setRequest(data.request);

            const results: any[] = data.results ?? [];
            const failed = results.filter((r) => !r.success);
            const successful = results.filter((r) => r.success);

            if (failed.length > 0) {
                const failDetails = failed
                    .map((f) => `${f.name}: ${Object.values(f.errors || {}).flat().join(', ')}`)
                    .join('; ');
                toast.error(`Failed to upload ${failed.length} file(s): ${failDetails}`);
            }

            if (successful.length > 0) {
                toast.success(`Uploaded ${successful.length} file(s)`);
            }
        } catch (err: unknown) {
            const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not upload the files.') : 'Could not upload the files.';
            setError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const retry = async (fileId: number) => {
        try {
            const { data } = await axios.post(route('requests.files.retry', [request.id, fileId]));
            setRequest(data.request);
            toast.success('Retrying file processing');
        } catch (err: unknown) {
            const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not retry this file.') : 'Could not retry this file.';
            setError(msg);
            toast.error(msg);
        }
    };

    const deleteFile = async (fileId: number) => {
        try {
            const { data } = await axios.delete(route('requests.files.destroy', [request.id, fileId]));
            setRequest(data.request);
            toast.success('Attachment deleted from disk');
        } catch (err: unknown) {
            const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not delete attachment.') : 'Could not delete attachment.';
            setError(msg);
            toast.error(msg);
        }
    };

    const remove = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await axios.delete(route('requests.destroy', request.id));
            toast.success('Request deleted');
            setShowDeleteDialog(false);
            router.visit(route('requests.index'));
        } catch (err: unknown) {
            const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not delete request.') : 'Could not delete request.';
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    const handleReloadFresh = () => {
        setConflict(null);
        router.reload({
            onSuccess: (page) => {
                const refreshed = (page.props as any).request;
                if (refreshed) setRequest(refreshed);
            },
        });
    };

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const files = Array.from(e.clipboardData?.files ?? []);
            if (files.length > 0 && canUpload) {
                e.preventDefault();
                uploadFiles(files);
                toast.info('Uploading pasted image from clipboard...');
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [canUpload, request.id]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const echo = (window as unknown as { Echo?: any }).Echo;
        if (!echo || !request.id) return;

        try {
            const channel = echo.private(`request.${request.id}`);

            channel.listen('.WorkRequestCommented', (e: WorkRequestCommentedBroadcast) => {
                if (e.actor_id && currentUserId && e.actor_id === currentUserId) {
                    return;
                }

                if (e.request?.activities) {
                    setRequest((prev) => ({
                        ...prev,
                        activities: e.request!.activities,
                        comments: e.request!.comments ?? prev.comments,
                        lock_version: e.request!.lock_version ?? prev.lock_version,
                    }));
                } else if (e.activity_id) {
                    setRequest((prev) => {
                        if (prev.activities?.some((a) => a.id === e.activity_id)) {
                            return prev;
                        }
                        const newActivity: RequestActivityItem = {
                            id: e.activity_id,
                            type: 'comment',
                            body: e.body,
                            user: undefined,
                            created_at: e.created_at || new Date().toISOString(),
                        };
                        return {
                            ...prev,
                            activities: [...(prev.activities || []), newActivity],
                        };
                    });
                }
                toast.info('New comment from teammate');
            });

            channel.listen('.SubtaskUpdated', (e: SubtaskUpdatedBroadcast) => {
                if (e.actor_id && currentUserId && e.actor_id === currentUserId) {
                    return;
                }

                if (e.parent_request?.subtasks) {
                    setRequest((prev) => ({
                        ...prev,
                        subtasks: e.parent_request!.subtasks,
                        subtasks_progress: e.parent_request!.subtasks_progress ?? prev.subtasks_progress,
                        lock_version: e.parent_request!.lock_version ?? prev.lock_version,
                    }));
                } else if (e.subtask && e.action) {
                    setRequest((prev) => {
                        const currentSubtasks = prev.subtasks || [];
                        let updatedSubtasks: WorkRequestCard[];
                        if (e.action === 'created') {
                            updatedSubtasks = [...currentSubtasks, e.subtask!];
                        } else if (e.action === 'deleted') {
                            updatedSubtasks = currentSubtasks.filter((s) => s.id !== e.subtask_id);
                        } else {
                            updatedSubtasks = currentSubtasks.map((s) =>
                                s.id === e.subtask_id ? { ...s, ...e.subtask } : s
                            );
                        }
                        return {
                            ...prev,
                            subtasks: updatedSubtasks,
                        };
                    });
                }

                const actionLabel = e.action === 'created' ? 'added' : e.action === 'toggled' ? 'updated' : 'removed';
                toast.info(`Subtask ${actionLabel} by teammate`);
            });

            const handleWorkRequestMoved = (e: WorkRequestMovedBroadcast) => {
                if (e.actor_id && currentUserId && e.actor_id === currentUserId) {
                    return;
                }

                if (e.request) {
                    const newStatus = e.request.status;
                    const newStatusLabel = e.request.status_label || newStatus;

                    setRequest((prev) => ({
                        ...prev,
                        status: newStatus,
                        status_label: e.request!.status_label || prev.status_label,
                        priority: e.request!.priority,
                        priority_label: e.request!.priority_label || prev.priority_label,
                        lock_version: e.request!.lock_version ?? prev.lock_version,
                        ...(e.request!.assignee !== undefined ? { assignee: e.request!.assignee, assignee_id: e.request!.assignee_id } : {}),
                        ...(e.request!.is_blocked !== undefined ? { is_blocked: e.request!.is_blocked, blocked_reason: e.request!.blocked_reason } : {}),
                        ...(e.request!.story_points !== undefined ? { story_points: e.request!.story_points } : {}),
                        ...(e.request!.due_date !== undefined ? { due_date: e.request!.due_date, due_human: e.request!.due_human, is_overdue: e.request!.is_overdue } : {}),
                    }));

                    if (newStatus === 'done') {
                        triggerConfetti();
                    }

                    toast.info(`Status updated to ${newStatusLabel}`);
                }
            };

            channel.listen('.WorkRequestMoved', handleWorkRequestMoved);

            const workspaceId = request.workspace_id;
            let workspaceChannel: any = null;
            if (workspaceId) {
                workspaceChannel = echo.private(`workspace.${workspaceId}`);
                workspaceChannel.listen('.WorkRequestMoved', (e: WorkRequestMovedBroadcast) => {
                    if (e.request_id === request.id || e.request?.id === request.id) {
                        handleWorkRequestMoved(e);
                    }
                });
            }

            channel.listen('.WorkRequestDeleted', (e: WorkRequestDeletedBroadcast) => {
                if (e.actor_id && currentUserId && e.actor_id === currentUserId) {
                    return;
                }

                setShowDeleteDialog(false);
                toast.error('This request was deleted by a teammate.');
                router.visit(route('requests.index'));
            });

            return () => {
                channel.stopListening('.WorkRequestCommented');
                channel.stopListening('.SubtaskUpdated');
                channel.stopListening('.WorkRequestMoved');
                channel.stopListening('.WorkRequestDeleted');
                echo.leave(`request.${request.id}`);

                if (workspaceChannel) {
                    workspaceChannel.stopListening('.WorkRequestMoved');
                }
            };
        } catch {
            // Graceful fallback
        }
    }, [request.id, request.workspace_id, currentUserId]);

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    crumbs={[
                        { label: 'Work', href: route('requests.index') },
                        { label: 'Board', href: route('requests.index') },
                        { label: `#REQ-${request.id}` },
                    ]}
                    title={
                        <span className="truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
                            {request.title}
                        </span>
                    }
                    badge={
                        <span className="rounded-md border border-zinc-750 bg-zinc-850 px-2 py-0.5 font-mono text-xs font-semibold text-zinc-300">
                            #{request.id}
                        </span>
                    }
                    actions={<LivePresenceAvatars requestId={request.id} />}
                />
            }
        >
            <Head title={`#${request.id} · ${request.title}`} />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* 409 Conflict Banner with Review and Reload actions */}
                {conflict && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur-md animate-in fade-in duration-150">
                        <div className="flex items-center gap-2.5">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                            <div>
                                <span className="font-bold text-white">{conflict.message}</span>
                                <p className="text-[11px] font-normal text-amber-300/80">
                                    Another team member made updates to this request while you were editing. Reload fresh state to merge.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setConflict((prev) => prev ? { ...prev, showDiff: !prev.showDiff } : null)}
                                className="rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 transition-colors"
                            >
                                {conflict.showDiff ? 'Hide Notice' : 'Review Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReloadFresh}
                                className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-300 transition-colors shadow-sm"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Reload Fresh State</span>
                            </button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300 shadow-sm">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                        <span>{error}</span>
                    </div>
                )}

                <RequestBlockerBanner
                    isBlocked={request.is_blocked}
                    blockedReason={request.blocked_reason}
                    canEdit={canEdit}
                    onResolve={() => update({ is_blocked: false })}
                    relations={request.relations}
                />
                <RequestHeroHeader request={request} canEdit={canEdit} canDelete={canDelete} saving={saving} onUpdate={update} onDelete={remove} />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-6">
                        <RequestDescriptionCard
                            description={request.description}
                            lockVersion={request.lock_version}
                            canEdit={canEdit}
                            onUpdate={update}
                        />
                        <RequestSubtasksSection
                            request={request}
                            canEdit={canEdit}
                            onSubtasksChange={(updated: WorkRequestDetail) => setRequest(updated)}
                        />
                        <RequestPullRequestsSection pullRequests={request.pull_requests || []} />
                        <RequestMediaGallery
                            files={request.files} canUpload={canUpload} uploading={uploading}
                            onUploadFiles={uploadFiles} onRetry={retry} onDeleteFile={deleteFile} onOpenLightbox={(src: string) => setLightboxSrc(src)}
                        />
                        <RequestDiscussionSection activities={request.activities} canComment={canComment} saving={saving} onAddComment={addComment} users={users} />
                    </div>

                    <RequestSidebarProperties
                        request={request} projects={projects} users={users} cycles={cycles} statuses={statuses}
                        priorities={priorities} canAssign={canAssign} canEdit={canEdit} onUpdate={update}
                        onRequestChange={(updated: WorkRequestDetail) => setRequest(updated)}
                    />
                </div>
            </div>

            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

            <ConfirmDialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title={`Delete work request "#REQ-${request.id}"?`}
                description="This will permanently delete this work request, its activity history, and uploaded attachments. This action cannot be undone."
                confirmLabel="Delete Request"
                variant="danger"
                loading={deleting}
            />
        </AuthenticatedLayout>
    );
}
