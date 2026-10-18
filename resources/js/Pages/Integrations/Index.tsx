import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Bot, Mail, Activity, Radio, Layers } from 'lucide-react';
import {
    DiscordConfig,
    EmailConfig,
    DeliveryLogItem,
    IntegrationKpiData,
    IntegrationKpiTiles,
    DiscordWebhookCard,
    DiscordLivePreview,
    EmailTemplateCard,
    EmailLivePreview,
    DeliveryLogTable,
} from '@/Features/Integrations';

export default function IntegrationsIndex({
    discord: initialDiscord,
    email: initialEmail,
    logs: initialLogs,
    kpis,
    canManage,
}: PageProps<{
    discord: DiscordConfig;
    email: EmailConfig;
    logs: DeliveryLogItem[];
    kpis: IntegrationKpiData;
    canManage: boolean;
}>) {
    const [discord, setDiscord] = useState<DiscordConfig>(initialDiscord);
    const [email, setEmail] = useState<EmailConfig>(initialEmail);
    const [logs, setLogs] = useState<DeliveryLogItem[]>(initialLogs);
    const [activeTab, setActiveTab] = useState<'all' | 'discord' | 'email' | 'logs'>('all');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                                Settings
                            </span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-[11px] text-zinc-500">Notifications</span>
                        </div>
                        <h1 className="mt-1 text-lg font-semibold text-zinc-100 sm:text-xl flex items-center gap-2">
                            <Radio className="h-5 w-5 text-violet-400" />
                            <span>Integrations & Notifications</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#111216] px-3 py-1 font-medium text-emerald-400 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Notifications Active
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Integrations & Notifications" />

            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* 1. High-Density Metric Tiles */}
                <IntegrationKpiTiles discord={discord} email={email} kpis={kpis} />

                {/* 2. Modern Tab Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                    <nav className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111216] p-1.5 shadow-sm">
                        <button
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeTab === 'all'
                                    ? 'border border-violet-500/40 bg-violet-500/10 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Layers className="h-3.5 w-3.5 text-violet-400" />
                            <span>All Channels</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('discord')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeTab === 'discord'
                                    ? 'border border-[#5865F2]/40 bg-[#5865F2]/10 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Bot className="h-3.5 w-3.5 text-[#5865F2]" />
                            <span>Discord Webhook</span>
                            <span
                                className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                                    discord.enabled && discord.configured
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-zinc-800 text-zinc-500'
                                }`}
                            >
                                {discord.enabled && discord.configured ? 'Live' : 'Off'}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('email')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeTab === 'email'
                                    ? 'border border-violet-500/40 bg-violet-500/10 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Mail className="h-3.5 w-3.5 text-violet-400" />
                            <span>Email Templates</span>
                            <span className="rounded-full px-1.5 py-0.2 text-[9px] font-bold bg-violet-500/20 text-violet-300">
                                {email.mailer.toUpperCase()}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeTab === 'logs'
                                    ? 'border border-cyan-500/40 bg-cyan-500/10 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Activity className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Delivery Logs</span>
                            <span className="rounded-full px-1.5 py-0.2 text-[9px] font-mono text-cyan-300 bg-cyan-500/20">
                                {logs.length}
                            </span>
                        </button>
                    </nav>

                    <span className="text-[11px] text-zinc-500 font-mono hidden md:inline">
                        Email & Discord Notifications
                    </span>
                </div>

                {/* 3. Tab Contents */}
                {activeTab === 'all' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <DiscordWebhookCard
                                    config={discord}
                                    onUpdated={(newCfg) => setDiscord(newCfg)}
                                    canManage={canManage}
                                />
                                <DiscordLivePreview config={discord} />
                            </div>

                            <div className="space-y-6">
                                <EmailTemplateCard
                                    config={email}
                                    onUpdated={(newCfg) => setEmail(newCfg)}
                                    canManage={canManage}
                                />
                                <EmailLivePreview config={email} />
                            </div>
                        </div>

                        {/* Recent Delivery Log Table */}
                        <DeliveryLogTable logs={logs} />
                    </div>
                )}

                {activeTab === 'discord' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7">
                            <DiscordWebhookCard
                                config={discord}
                                onUpdated={(newCfg) => setDiscord(newCfg)}
                                canManage={canManage}
                            />
                        </div>
                        <div className="lg:col-span-5">
                            <DiscordLivePreview config={discord} />
                        </div>
                    </div>
                )}

                {activeTab === 'email' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-5">
                            <EmailTemplateCard
                                config={email}
                                onUpdated={(newCfg) => setEmail(newCfg)}
                                canManage={canManage}
                            />
                        </div>
                        <div className="lg:col-span-7">
                            <EmailLivePreview config={email} />
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <DeliveryLogTable logs={logs} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
