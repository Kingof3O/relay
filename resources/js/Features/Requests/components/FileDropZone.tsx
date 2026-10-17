import { ReactNode, useState, DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileDropZoneProps {
    children: ReactNode;
    onFilesDropped: (files: File[]) => void;
    className?: string;
    disabled?: boolean;
    label?: string;
}

export default function FileDropZone({
    children,
    onFilesDropped,
    className = '',
    disabled = false,
    label = 'Drop files to attach to this request',
}: FileDropZoneProps) {
    const [dragCounter, setDragCounter] = useState(0);

    const isDragging = dragCounter > 0;

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
            setDragCounter((prev) => prev + 1);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        setDragCounter((prev) => Math.max(0, prev - 1));
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(0);
        if (disabled) return;

        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            onFilesDropped(files);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative ${className}`}
        >
            {children}

            {/* Drag & Drop Visual Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-500/80 bg-[#0c0d12]/90 backdrop-blur-md p-6 text-center animate-in fade-in-0 duration-150 pointer-events-none">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/40 bg-violet-500/10 text-violet-400 mb-3 shadow-specular animate-bounce">
                        <UploadCloud className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-zinc-400 mt-1">Images, PDFs, or design assets up to 500MB</p>
                </div>
            )}
        </div>
    );
}
