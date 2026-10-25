import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Check, Loader2, Send, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import type { DiscordConfig } from '../types';

interface Props {
    config: DiscordConfig;
    onUpdated: (newConfig: DiscordConfig) => void;
    canManage: boolean;
}

export function DiscordWebhookCard({ config, onUpdated, canManage }: Props) {
    const [enabled, setEnabled] = useState(config.enabled);

    const getInitialUrls = (cfg: DiscordConfig): string[] => {
        if (cfg.webhook_urls && cfg.webhook_urls.length > 0) {
            return cfg.webhook_urls;
        }
        if (cfg.webhook_url) {
            return [cfg.webhook_url];
        }
        return [''];
    };

    const [webhookUrls, setWebhookUrls] = useState<string[]>(getInitialUrls(config));
    const [botName, setBotName] = useState(config.bot_name || 'Relay Studio');
    const [avatarUrl, setAvatarUrl] = useState(config.avatar_url || '');
    const [events, setEvents] = useState(config.events);

    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        setEnabled(config.enabled);
        setBotName(config.bot_name || 'Relay Studio');
        setAvatarUrl(config.avatar_url || '');
        setEvents(config.events);
        setWebhookUrls(getInitialUrls(config));
    }, [config]);

    const toggleEvent = (key: string) => {
        setEvents((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleUrlChange = (index: number, val: string) => {
        // Auto-split if user pasted multiple URLs separated by newlines or commas
        if (val.includes('\n') || val.includes(',')) {
            const split = val
                .split(/[\r\n,]+/)
                .map((s) => s.trim())
                .filter(Boolean);

            if (split.length > 1) {
                setWebhookUrls((prev) => {
                    const updated = [...prev];
                    updated.splice(index, 1, ...split);
                    return updated;
                });
                return;
            }
        }

        setWebhookUrls((prev) => {
            const updated = [...prev];
            updated[index] = val;
            return updated;
        });
    };

    const handleAddUrl = () => {
        setWebhookUrls((prev) => [...prev, '']);
    };

    const handleRemoveUrl = (index: number) => {
        setWebhookUrls((prev) => {
            if (prev.length <= 1) {
                return [''];
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const cleanedUrls = webhookUrls.map((u) => u.trim()).filter(Boolean);
    const validCount = cleanedUrls.length;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage(null);

        try {
            const response = await axios.post(route('integrations.discord.update'), {
                enabled,
                webhook_urls: cleanedUrls,
                webhook_url: cleanedUrls[0] || null,
                bot_name: botName.trim() || 'Relay Studio',
                avatar_url: avatarUrl.trim() || null,
                events,
            });

            onUpdated(response.data.discord);
            setStatusMessage({ type: 'success', text: response.data.message || 'Settings saved successfully.' });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to save Discord settings.';
            setStatusMessage({ type: 'error', text: msg });
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestPing = async () => {
        setIsTesting(true);
        setStatusMessage(null);

        try {
            const response = await axios.post(route('integrations.discord.test'), {
                webhook_urls: cleanedUrls.length > 0 ? cleanedUrls : null,
                webhook_url: cleanedUrls[0] || null,
            });

            setStatusMessage({ type: 'success', text: response.data.message || 'Test message sent to Discord!' });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to deliver test message to Discord.';
            setStatusMessage({ type: 'error', text: msg });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-5 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2]">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                            <span>Discord Webhook & Bot Integration</span>
                            <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    enabled && (config.configured || validCount > 0)
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60'
                                }`}
                            >
                                {enabled && (config.configured || validCount > 0)
                                    ? validCount > 1
                                        ? `${validCount} Webhooks Active`
                                        : 'Active'
                                    : enabled
                                    ? 'No URL'
                                    : 'Disabled'}
                            </span>
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Automatically broadcast ticket dispatches, status changes, and roadblocks to your Discord channel(s).
                        </p>
                    </div>
                </div>

                {/* Active Switch Toggle */}
                {canManage && (
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5865F2]"></div>
                        <span className="ml-3 text-xs font-medium text-zinc-300">
                            {enabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </label>
                )}
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
                {/* Webhook URLs List */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                            Discord Incoming Webhook URLs {validCount > 1 && `(${validCount})`}
                        </label>
                        {canManage && (
                            <button
                                type="button"
                                onClick={handleAddUrl}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5865F2] hover:text-[#7983f5] transition-colors"
                            >
                                <Plus className="h-3 w-3" />
                                <span>Add Another Webhook</span>
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {webhookUrls.map((url, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="url"
                                        disabled={!canManage}
                                        value={url}
                                        onChange={(e) => handleUrlChange(idx, e.target.value)}
                                        placeholder="https://discord.com/api/webhooks/1234567890/abcdef..."
                                        className="w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50"
                                    />
                                </div>
                                {canManage && (webhookUrls.length > 1 || url.trim().length > 0) && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUrl(idx)}
                                        title="Remove webhook"
                                        className="p-2.5 rounded-lg border border-zinc-800 bg-[#090a0f] text-zinc-400 hover:text-rose-400 hover:border-rose-900/40 transition-colors shrink-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="mt-1 text-[11px] text-zinc-500">
                        In Discord: Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL. You can configure multiple channels or servers.
                    </p>
                </div>

                {/* Bot Customization Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Bot Nickname
                        </label>
                        <input
                            type="text"
                            disabled={!canManage}
                            value={botName}
                            onChange={(e) => setBotName(e.target.value)}
                            placeholder="Relay Studio"
                            className="w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Bot Avatar Image URL (Optional)
                        </label>
                        <input
                            type="url"
                            disabled={!canManage}
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://your-domain.com/logo.png"
                            className="w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* Subscribed Events Toggles */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                        Notification Triggers
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        {[
                            { key: 'ticket_created', label: '🆕 Task Created' },
                            { key: 'ticket_assigned', label: '⚡ Task Assigned' },
                            { key: 'ticket_status', label: '🔄 Status & Review' },
                            { key: 'ticket_blocked', label: '🚧 Blocked Tasks' },
                            { key: 'ticket_comment', label: '💬 Comments & Mentions' },
                        ].map((evt) => (
                            <label
                                key={evt.key}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                                    events[evt.key]
                                        ? 'border-[#5865F2]/40 bg-[#5865F2]/10 text-zinc-200'
                                        : 'border-zinc-800/80 bg-[#090a0f] text-zinc-400 hover:border-zinc-700'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    disabled={!canManage}
                                    checked={!!events[evt.key]}
                                    onChange={() => toggleEvent(evt.key)}
                                    className="rounded border-zinc-700 bg-zinc-900 text-[#5865F2] focus:ring-0"
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
                            onClick={handleTestPing}
                            disabled={isTesting || validCount === 0}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#14161c] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-colors shadow-sm"
                        >
                            {isTesting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5 text-[#5865F2]" />
                            )}
                            <span>
                                {validCount > 1 ? `Send Test Ping to All (${validCount}) Webhooks` : 'Send Test Ping to Discord'}
                            </span>
                        </button>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4752c4] disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Save className="h-3.5 w-3.5" />
                            )}
                            <span>Save Discord Settings</span>
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
