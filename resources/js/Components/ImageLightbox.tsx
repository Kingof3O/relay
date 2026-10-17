import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';

interface ImageLightboxProps {
    src: string | null;
    alt?: string;
    onClose: () => void;
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!src) return null;

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale((prev) => Math.min(prev + 0.3, 3));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setScale((prev) => Math.max(prev - 0.3, 0.6));
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in-0 duration-150 select-none"
            onClick={onClose}
        >
            {/* Top Toolbar */}
            <div
                className="absolute top-4 right-4 flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#121318]/90 p-1.5 shadow-2xl backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={handleZoomOut}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono text-zinc-400 px-1">{Math.round(scale * 100)}%</span>
                <button
                    type="button"
                    onClick={handleZoomIn}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>
                <a
                    href={src}
                    download
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Download Image"
                >
                    <Download className="h-4 w-4" />
                </a>
                <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    title="Open in new tab"
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
                <div className="h-4 w-[1px] bg-zinc-800 mx-0.5" />
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
                    title="Close (Esc)"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Image Container */}
            <div
                className="max-h-[85vh] max-w-[90vw] overflow-auto flex items-center justify-center transition-transform duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt={alt ?? 'Attached preview'}
                    style={{ transform: `scale(${scale})` }}
                    className="max-h-[82vh] max-w-[88vw] object-contain rounded-xl shadow-2xl transition-transform duration-100 border border-white/10"
                />
            </div>
        </div>
    );
}
