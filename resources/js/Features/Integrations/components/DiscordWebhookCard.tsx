import React, { useState } from 'react';
import axios from 'axios';
import { Bot, Check, Loader2, Send, Save, AlertCircle, ShieldAlert } from 'lucide-react';
import type { DiscordConfig } from '../types';

interface Props {
    config: DiscordConfig;
    onUpdated: (newConfig: DiscordConfig) => void;
    canManage: boolean;
}

export function DiscordWebhookCard({ config, onUpdated, canManage }: Props) {
    const [enabled, setEnabled] = useState(config.enabled);
    const [webhookUrl, setWebhookUrl] = useState(config.webhook_url || '');
    const [botName, setBotName] = useState(config.bot_name || 'Relay Studio');
    const [avatarUrl, setAvatarUrl] = useState(config.avatar_url || '');
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
            const response = await axios.post(route('integrations.discord.update'), {
                enabled,
                webhook_url: webhookUrl.trim() || null,
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
                webhook_url: webhookUrl.trim() || null,
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
                                    enabled && config.configured
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60'
                                }`}
                            >
                                {enabled && config.configured ? 'Active' : enabled ? 'No URL' : 'Disabled'}
                            </span>
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Automatically broadcast ticket dispatches, status changes, and roadblocks to your Discord channel.
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
                {/* Webhook URL Input */}
                <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Discord Incoming Webhook URL
                    </label>
                    <input
                        type="url"
                        disabled={!canManage}
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://discord.com/api/webhooks/1234567890/abcdef..."
                        className="w-full rounded-lg border border-zinc-800 bg-[#090a0f] px-3.5 py-2.5 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] disabled:opacity-50"
                    />
                    <p className="mt-1 text-[11px] text-zinc-500">
                        In Discord: Server Settings → Integrations → Webhooks → New Webhook → Copy Webhook URL.
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
                        Broadcast Triggers & Event Subscriptions
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
                            disabled={isTesting || !webhookUrl}
                            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#14161c] px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white disabled:opacity-40 transition-colors shadow-sm"
                        >
                            {isTesting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5 text-[#5865F2]" />
                            )}
                            <span>Send Test Ping to Discord</span>
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
