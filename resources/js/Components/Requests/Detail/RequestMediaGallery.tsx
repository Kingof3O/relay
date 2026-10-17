import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import FileDropZone from '@/Components/Requests/FileDropZone';
import { RequestFileItem } from '@/types/workspace';
import { UploadCloud, RefreshCw, Paperclip } from 'lucide-react';

interface RequestMediaGalleryProps {
    files: RequestFileItem[];
    canUpload: boolean;
    uploading: boolean;
    onUploadFiles: (files: File[]) => void;
    onRetry: (fileId: number) => Promise<void> | void;
    onOpenLightbox: (url: string) => void;
}

export default function RequestMediaGallery({
    files,
    canUpload,
    uploading,
    onUploadFiles,
    onRetry,
    onOpenLightbox,
}: RequestMediaGalleryProps) {
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
                            Images optimized to WebP · Videos ready for streaming · Up to 500MB
                        </p>
                    </div>
                    {canUpload && (
                        <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-3.5 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:border-violet-400 hover:bg-violet-500/10 hover:text-white">
                            <UploadCloud className="h-3.5 w-3.5 text-violet-400" />
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={(event) => {
                                    const selected = Array.from(event.target.files ?? []);
                                    if (selected.length) onUploadFiles(selected);
                                    event.target.value = '';
                                }}
                            />
                            <span>{uploading ? 'Uploading…' : '+ Add Media'}</span>
                        </label>
                    )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {files.length ? (
                        files.map((file) => (
                            <div
                                key={file.id}
                                className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#07090e]/90 shadow-specular"
                            >
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
                                {file.processing_status === 'ready' && file.type === 'video' && file.url && (
                                    <video
                                        controls
                                        poster={file.preview_url ?? undefined}
                                        className="aspect-video w-full bg-black object-cover"
                                    >
                                        <source src={file.url} type="video/mp4" />
                                    </video>
                                )}
                                <div className="p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <p
                                            className="truncate text-xs font-medium text-zinc-200"
                                            title={file.original_name}
                                        >
                                            {file.original_name}
                                        </p>
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
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] px-4 py-10 text-center">
                            <Paperclip className="h-6 w-6 text-zinc-600 mb-2" />
                            <p className="text-xs text-zinc-500 font-medium">No media or attachments attached yet.</p>
                            <p className="text-[11px] text-zinc-600 mt-1">Drag and drop files or paste images (⌘V)</p>
                        </div>
                    )}
                </div>
            </Card>
        </FileDropZone>
    );
}
