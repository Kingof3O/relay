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
import { WorkspaceProject, WorkspaceUser, WorkRequestDetail } from '@/types/workspace';
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

export default function Show({
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
