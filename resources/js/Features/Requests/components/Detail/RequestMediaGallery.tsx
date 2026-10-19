import { useState } from 'react';
import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import ConfirmDialog from '@/Components/ConfirmDialog';
import FileDropZone from '../FileDropZone';
import { RequestFileItem } from '@/types/workspace';
import {
    UploadCloud,
    RefreshCw,
    Paperclip,
    FileText,
    FileCode,
    Archive,
    Download,
    Trash2,
} from 'lucide-react';

interface RequestMediaGalleryProps {
    files: RequestFileItem[];
    canUpload: boolean;
    uploading: boolean;
    onUploadFiles: (files: File[]) => void;
    onRetry: (fileId: number) => Promise<void> | void;
    onDeleteFile?: (fileId: number) => Promise<void> | void;
    onOpenLightbox: (url: string) => void;
}

function formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function RequestMediaGallery({
    files,
    canUpload,
    uploading,
    onUploadFiles,
    onRetry,
    onDeleteFile,
    onOpenLightbox,
}: RequestMediaGalleryProps) {
    const [fileToDelete, setFileToDelete] = useState<RequestFileItem | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        if (!fileToDelete || !onDeleteFile) return;
        setDeleting(true);
        try {
            await onDeleteFile(fileToDelete.id);
            setFileToDelete(null);
        } finally {
            setDeleting(false);
        }
    };
    return (
        <FileDropZone
            onFilesDropped={onUploadFiles}
            label="Drop media or attachments to upload"
            disabled={!canUpload}
        >
            <Card className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                            Media & Attachments
                        </h2>
                        <p className="mt-0.5 text-[11px] text-zinc-500">
                            Documents, PDFs, logs, archives, images, and videos · Up to 500MB
                        </p>
                    </div>
                    {canUpload && (
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-violet-400 hover:bg-violet-500/10 hover:text-white">
                            <UploadCloud className="h-3.5 w-3.5 text-violet-400" />
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*,application/pdf,text/*,application/json,application/zip,application/x-zip-compressed,.pdf,.log,.txt,.json,.zip,.csv,.doc,.docx"
                                className="hidden"
                                onChange={(event) => {
                                    const selected = Array.from(event.target.files ?? []);
                                    if (selected.length) onUploadFiles(selected);
                                    event.target.value = '';
                                }}
                            />
                            <span>{uploading ? 'Uploading…' : '+ Add Attachment'}</span>
                        </label>
                    )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {files.length ? (
                        files.map((file) => {
                            const nameLower = file.original_name.toLowerCase();
                            const isPdf = file.mime_type === 'application/pdf' || nameLower.endsWith('.pdf');
                            const isCodeOrLog =
                                nameLower.endsWith('.log') ||
                                nameLower.endsWith('.json') ||
                                nameLower.endsWith('.txt') ||
                                nameLower.endsWith('.csv') ||
                                nameLower.endsWith('.md') ||
                                file.mime_type?.includes('json') ||
                                file.mime_type?.includes('text');
                            const isArchive =
                                nameLower.endsWith('.zip') ||
                                nameLower.endsWith('.tar') ||
                                nameLower.endsWith('.gz') ||
                                file.mime_type?.includes('zip');

                            return (
                                <div
                                    key={file.id}
                                    className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#07090e]/90 shadow-specular"
                                >
                                    {/* Image Preview */}
                                    {file.processing_status === 'ready' && file.type === 'image' && file.url && (
                                        <div
                                            onClick={() => onOpenLightbox(file.url!)}
                                            className="cursor-pointer overflow-hidden group"
                                            title="Click to view full image"
                                        >
                                            <img
                                                src={file.url}
                                                alt={file.original_name}
                                                className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    )}

                                    {/* Video Player */}
                                    {file.processing_status === 'ready' && file.type === 'video' && file.url && (
                                        <video
                                            controls
                                            poster={file.preview_url ?? undefined}
                                            className="aspect-video w-full bg-black object-cover"
                                        >
                                            <source src={file.url} type="video/mp4" />
                                        </video>
                                    )}

                                    {/* Document Card */}
                                    {file.type === 'document' && (
                                        <div className="flex flex-col justify-between p-4 bg-zinc-900/40 border-b border-white/[0.06] min-h-[110px]">
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                                        isPdf
                                                            ? 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                                                            : isCodeOrLog
                                                            ? 'border-sky-500/30 bg-sky-500/10 text-sky-400'
                                                            : isArchive
                                                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                                            : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                                                    }`}
                                                >
                                                    {isPdf ? (
                                                        <FileText className="h-5 w-5" />
                                                    ) : isCodeOrLog ? (
                                                        <FileCode className="h-5 w-5" />
                                                    ) : isArchive ? (
                                                        <Archive className="h-5 w-5" />
                                                    ) : (
                                                        <FileText className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {isPdf && (
                                                            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-300 uppercase tracking-wide border border-rose-500/30">
                                                                PDF
                                                            </span>
                                                        )}
                                                        {isCodeOrLog && (
                                                            <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 uppercase tracking-wide border border-sky-500/30">
                                                                CODE / LOG
                                                            </span>
                                                        )}
                                                        {isArchive && (
                                                            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase tracking-wide border border-amber-500/30">
                                                                ARCHIVE
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-zinc-500">
                                                            {formatBytes(file.size)}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className="mt-1 truncate text-xs font-medium text-zinc-200"
                                                        title={file.original_name}
                                                    >
                                                        {file.original_name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-end gap-2">
                                                {file.url && (
                                                    <a
                                                        href={file.url}
                                                        download={file.original_name}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-violet-400 hover:bg-violet-500/10 hover:text-white"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        <span>Download</span>
                                                    </a>
                                                )}
                                                {canUpload && onDeleteFile && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFileToDelete(file)}
                                                        className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] p-1 text-[11px] text-zinc-400 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
                                                        title="Delete attachment from disk"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p
                                                className="truncate text-xs font-medium text-zinc-200"
                                                title={file.original_name}
                                            >
                                                {file.original_name}
                                            </p>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Badge
                                                    variant={
                                                        file.processing_status === 'ready'
                                                            ? 'emerald'
                                                            : file.processing_status === 'failed'
                                                            ? 'rose'
                                                            : 'amber'
                                                    }
                                                    dot
                                                >
                                                    {file.processing_status === 'ready'
                                                        ? 'Ready'
                                                        : file.processing_status === 'failed'
                                                        ? 'Failed'
                                                        : 'Processing'}
                                                </Badge>
                                                {canUpload && onDeleteFile && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFileToDelete(file)}
                                                        className="rounded p-1 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                                                        title="Delete attachment from disk"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {file.processing_status === 'failed' && (
                                            <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-300">
                                                <p>{file.processing_error || 'Processing failed.'}</p>
                                                {canUpload && (
                                                    <button
                                                        type="button"
                                                        onClick={() => onRetry(file.id)}
                                                        className="mt-1.5 flex items-center gap-1 font-semibold text-violet-300 hover:text-white"
                                                    >
                                                        <RefreshCw className="h-3 w-3" /> Retry processing
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] px-4 py-10 text-center">
                            <Paperclip className="h-6 w-6 text-zinc-600 mb-2" />
                            <p className="text-xs text-zinc-500 font-medium">No media or attachments attached yet.</p>
                            <p className="text-[11px] text-zinc-600 mt-1">Drag and drop files, documents, or paste images (⌘V)</p>
                        </div>
                    )}
                </div>
            </Card>

            <ConfirmDialog
                open={!!fileToDelete}
                onClose={() => setFileToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Attachment"
                description={`Are you sure you want to delete "${fileToDelete?.original_name}"? This file and all its optimized copies will be permanently deleted from your disk.`}
                confirmLabel="Delete File"
                variant="danger"
                loading={deleting}
            />
        </FileDropZone>
    );
}
