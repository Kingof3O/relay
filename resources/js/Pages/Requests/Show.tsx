import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ImageLightbox from '@/Components/ImageLightbox';
import {
    RequestHeroHeader,
    RequestBlockerBanner,
    RequestDescriptionCard,
    RequestSubtasksSection,
    RequestMediaGallery,
    RequestDiscussionSection,
    RequestSidebarProperties,
} from '@/Features/Requests';
import { triggerConfetti } from '@/Utils/confetti';
import { PageProps } from '@/types';
import { WorkspaceProject, WorkspaceUser, WorkRequestDetail } from '@/types/workspace';
import axios, { isAxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ChevronRight, ArrowLeft, AlertTriangle } from 'lucide-react';

type ShowProps = PageProps<{
    request: WorkRequestDetail;
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    canAssign: boolean;
    canEdit: boolean;
    canComment: boolean;
    canUpload: boolean;
    canDelete: boolean;
}>;

export default function Show({
    request: initialRequest, projects, users, statuses, priorities,
    canAssign, canEdit, canComment, canUpload, canDelete,
}: ShowProps) {
    const [request, setRequest] = useState(initialRequest);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    const update = async (changes: Record<string, unknown>) => {
        setSaving(true);
        setError(null);
        try {
            const { data } = await axios.patch(route('requests.update', request.id), changes);
            setRequest(data.request);
            if (changes.status === 'done') triggerConfetti();
            toast.success('Request updated');
        } catch (err: unknown) {
            const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not save this change.') : 'Could not save this change.';
            setError(msg);
            toast.error(msg);
        } finally { setSaving(false); }
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
        } finally { setSaving(false); }
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
            toast.success(`Uploaded ${files.length} file(s)`);
        } catch (err: unknown) {
            const msg = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not upload the files.') : 'Could not upload the files.';
            setError(msg);
            toast.error(msg);
        } finally { setUploading(false); }
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

    const remove = async () => {
        if (!window.confirm('Permanently delete this request, its activity, and its media? They cannot be recovered.')) return;
        await axios.delete(route('requests.destroy', request.id));
        toast.success('Request deleted');
        router.visit(route('requests.index'));
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
                <div className="flex items-center gap-2 text-xs">
                    <Link href={route('requests.index')} className="flex items-center gap-1.5 font-semibold text-zinc-400 transition-colors hover:text-white">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Work Board</span>
                    </Link>
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] font-bold text-violet-300">
                        #{request.id}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
                    <span className="max-w-[280px] truncate font-medium text-zinc-300 sm:max-w-md">{request.title}</span>
                </div>
            }
        >
            <Head title={`#${request.id} · ${request.title}`} />

            <div className="mx-auto max-w-6xl space-y-6">
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
                        <RequestDescriptionCard description={request.description} canEdit={canEdit} onUpdate={update} />
                        <RequestSubtasksSection
                            request={request}
                            canEdit={canEdit}
                            onSubtasksChange={(updated: WorkRequestDetail) => setRequest(updated)}
                        />
                        <RequestMediaGallery
                            files={request.files} canUpload={canUpload} uploading={uploading}
                            onUploadFiles={uploadFiles} onRetry={retry} onOpenLightbox={(src: string) => setLightboxSrc(src)}
                        />
                        <RequestDiscussionSection activities={request.activities} canComment={canComment} saving={saving} onAddComment={addComment} users={users} />
                    </div>

                    <RequestSidebarProperties
                        request={request} projects={projects} users={users} statuses={statuses}
                        priorities={priorities} canAssign={canAssign} canEdit={canEdit} onUpdate={update}
                        onRequestChange={(updated: WorkRequestDetail) => setRequest(updated)}
                    />
                </div>
            </div>

            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </AuthenticatedLayout>
    );
}
