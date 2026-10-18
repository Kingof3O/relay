import React, { useState } from 'react';
import { Eye, RefreshCw, ExternalLink } from 'lucide-react';
import type { EmailConfig } from '../types';

interface Props {
    config: EmailConfig;
}

const PREVIEW_EVENTS = [
    { key: 'assignment', label: '⚡ Work Assigned' },
    { key: 'review', label: '👀 Review Request' },
    { key: 'done', label: '✅ Work Completed' },
    { key: 'blocked', label: '🚧 Roadblock Flagged' },
    { key: 'comment', label: '💬 New Comment' },
];

export function EmailLivePreview({ config }: Props) {
    const [selectedEvent, setSelectedEvent] = useState('assignment');
    const [refreshKey, setRefreshKey] = useState(0);

    const previewUrl = route('integrations.email.preview') + `?event=${selectedEvent}&_k=${refreshKey}`;

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#090a0f] p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-violet-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        Live HTML Email Template Preview
                    </h3>
                </div>

                {/* Event Selectors */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {PREVIEW_EVENTS.map((evt) => (
                        <button
                            key={evt.key}
                            type="button"
                            onClick={() => setSelectedEvent(evt.key)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                                selectedEvent === evt.key
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm'
                                    : 'bg-[#14161c] text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                            }`}
                        >
                            {evt.label}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setRefreshKey((k) => k + 1)}
                        title="Refresh Preview"
                        className="p-1 rounded text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Responsive Email Preview Frame */}
            <div className="rounded-lg border border-zinc-800/80 bg-[#050608] overflow-hidden shadow-inner">
                <iframe
                    key={`${selectedEvent}-${refreshKey}`}
                    src={previewUrl}
                    title="Email Template Live Preview"
                    className="w-full h-[540px] border-none bg-transparent"
                />
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 font-mono">
                <span>View rendered with Plus Jakarta Sans & inline email CSS</span>
                <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-violet-400 hover:underline"
                >
                    <span>Open in new tab</span>
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </div>
    );
}
