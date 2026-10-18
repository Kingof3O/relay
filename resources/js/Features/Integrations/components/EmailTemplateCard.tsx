import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Check, Loader2, Send, Save, AlertCircle, Palette } from 'lucide-react';
import type { EmailConfig } from '../types';

interface Props {
    config: EmailConfig;
    onUpdated: (newConfig: EmailConfig) => void;
    canManage: boolean;
}

const PRESET_COLORS = [
    { label: 'Violet (Default)', hex: '#8B5CF6' },
    { label: 'Indigo', hex: '#6366F1' },
    { label: 'Sky Blue', hex: '#0284C7' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Amber', hex: '#F59E0B' },
    { label: 'Rose', hex: '#F43F5E' },
];

export function EmailTemplateCard({ config, onUpdated, canManage }: Props) {
    const [senderName, setSenderName] = useState(config.sender_name);
    const [accentColor, setAccentColor] = useState(config.accent_color || '#8B5CF6');
    const [logoUrl, setLogoUrl] = useState(config.logo_url || '');
    const [footerNote, setFooterNote] = useState(config.footer_note || '');
    const [events, setEvents] = useState(config.events);

    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const toggleEvent = (key: string) => {
        setEvents((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage(null);

        try {
            const response = await axios.post(route('integrations.email.update'), {
                sender_name: senderName.trim(),
                accent_color: accentColor,
                logo_url: logoUrl.trim() || null,
                footer_note: footerNote.trim(),
                events,
            });

            onUpdated(response.data.email);
            setStatusMessage({ type: 'success', text: response.data.message || 'Email settings saved successfully.' });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to save email settings.';
            setStatusMessage({ type: 'error', text: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendTest = async () => {
        setIsTesting(true);
        setStatusMessage(null);

        try {
            const response = await axios.post(route('integrations.email.test'), {
                event: 'assignment',
            });

            setStatusMessage({ type: 'success', text: response.data.message || 'Test email dispatched to your inbox!' });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to deliver test email.';
            setStatusMessage({ type: 'error', text: msg });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-5 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                            <span>Transactional Email Dispatcher & Templates</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                {config.mailer.toUpperCase()}
                            </span>
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Branded dark-mode HTML email notifications dispatched on ticket updates, assignments, and reviews.
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-[11px] text-zinc-500 font-mono block">From Address</span>
                    <span className="text-xs text-zinc-300 font-mono">{config.from_address}</span>
                </div>
            </div>

            {statusMessage && (
                <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                        statusMessage.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                >
                    {statusMessage.type === 'success' ? (
                        <Check className="h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
                {/* Sender Brand Name */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Brand / Sender Name
                    </label>
                    <input
                        type="text"
                        disabled={!canManage}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Relay Studio"
                        className="w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    />
                    <p className="mt-1 text-[11px] text-zinc-500">
                        Appears as the display name in the email subject and top navigation bar.
                    </p>
                </div>

                {/* Brand Logo URL with Live Thumbnail */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Brand Logo Image URL
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#090a0f] border border-zinc-800 p-1.5 flex items-center justify-center shrink-0">
                            <img
                                src={logoUrl || '/img/logo.png'}
                                alt="Logo Preview"
                                className="h-full w-full object-contain rounded"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/img/logo.png';
                                }}
                            />
                        </div>
                        <input
                            type="url"
                            disabled={!canManage}
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="/img/logo.png or https://your-domain.com/logo.png"
                            className="flex-1 rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                        />
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-500">
                        Default uses the bundled high-resolution Relay Studio mark (<code className="text-zinc-400">/img/logo.png</code>).
                    </p>
                </div>

                {/* Accent Color Swatches */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Palette className="h-3.5 w-3.5 text-violet-400" />
                        <span>Email Top Accent & Highlight Color</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                        {PRESET_COLORS.map((col) => (
                            <button
                                key={col.hex}
                                type="button"
                                disabled={!canManage}
                                onClick={() => setAccentColor(col.hex)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                                    accentColor.toLowerCase() === col.hex.toLowerCase()
                                        ? 'border-white/40 bg-zinc-800 text-white shadow-sm ring-1 ring-white/20'
                                        : 'border-zinc-800 bg-[#090a0f] text-zinc-400 hover:border-zinc-700'
                                }`}
                            >
                                <span
                                    className="h-3.5 w-3.5 rounded-full border border-black/40 shadow-sm"
                                    style={{ backgroundColor: col.hex }}
                                />
                                <span>{col.label}</span>
                            </button>
                        ))}

                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[11px] font-mono text-zinc-500">Custom:</span>
                            <input
                                type="text"
                                disabled={!canManage}
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="w-24 rounded border border-zinc-800 bg-[#090a0f] px-2 py-1 text-xs font-mono text-zinc-200 uppercase focus:border-violet-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Footer Note / Organization Signature
                    </label>
                    <input
                        type="text"
                        disabled={!canManage}
                        value={footerNote}
                        onChange={(e) => setFooterNote(e.target.value)}
                        placeholder="Relay Studio · Enterprise Engineering & Dispatch Automation"
                        className="w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    />
                </div>

                {/* Subscribed Events Toggles */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                        Email Event Triggers
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        {[
                            { key: 'ticket_created', label: '🆕 Ticket Created' },
                            { key: 'ticket_assigned', label: '⚡ Work Assigned' },
                            { key: 'ticket_status', label: '🔄 Status & Review' },
                            { key: 'ticket_blocked', label: '🚧 Blockers & Roadblocks' },
                            { key: 'ticket_comment', label: '💬 Comments & Mentions' },
                        ].map((evt) => (
                            <label
                                key={evt.key}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                                    events[evt.key]
                                        ? 'border-violet-500/40 bg-violet-500/10 text-zinc-200'
                                        : 'border-zinc-800/80 bg-[#090a0f] text-zinc-400 hover:border-zinc-700'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    disabled={!canManage}
                                    checked={!!events[evt.key]}
                                    onChange={() => toggleEvent(evt.key)}
                                    className="rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-0"
                                />
                                <span className="font-medium text-[11px]">{evt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                {canManage && (
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                        <button
                            type="button"
                            onClick={handleSendTest}
                            disabled={isTesting}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#14161c] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-colors shadow-sm"
                        >
                            {isTesting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5 text-violet-400" />
                            )}
                            <span>Send Test Email to Me</span>
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Save className="h-3.5 w-3.5" />
                            )}
                            <span>Save Email Settings</span>
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
