import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Bot, Mail, Activity, Layers } from 'lucide-react';
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
                <PageHeader
                    crumbs={[
                        { label: 'Settings', href: route('settings.index') },
                        { label: 'Integrations & Webhooks' },
                    ]}
                    title="Integrations & Notifications"
                    actions={
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#111216] px-3 py-1 text-xs font-medium text-emerald-400 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Notifications Active
                        </span>
                    }
                />
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
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <Layers className={`h-3.5 w-3.5 ${activeTab === 'all' ? 'text-zinc-200' : 'text-zinc-500'}`} />
                            <span>All Channels</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('discord')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeTab === 'discord'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <Bot className={`h-3.5 w-3.5 ${activeTab === 'discord' ? 'text-zinc-200' : 'text-zinc-500'}`} />
                            <span>Discord Webhook</span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                    discord.enabled && discord.configured
                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                                        : 'bg-zinc-850 text-zinc-500'
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
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <Mail className={`h-3.5 w-3.5 ${activeTab === 'email' ? 'text-zinc-200' : 'text-zinc-500'}`} />
                            <span>Email Templates</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                activeTab === 'email'
                                    ? 'bg-zinc-750 text-zinc-300'
                                    : 'bg-zinc-850 text-zinc-500'
                            }`}>
                                {email.mailer.toUpperCase()}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                activeTab === 'logs'
                                    ? 'border border-zinc-700 bg-zinc-800 text-white shadow-sm'
                                    : 'border border-transparent text-zinc-400 hover:border-zinc-750 hover:bg-[#14161c] hover:text-zinc-200'
                            }`}
                        >
                            <Activity className={`h-3.5 w-3.5 ${activeTab === 'logs' ? 'text-zinc-200' : 'text-zinc-500'}`} />
                            <span>Delivery Logs</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                activeTab === 'logs'
                                    ? 'bg-zinc-750 text-zinc-300'
                                    : 'bg-zinc-850 text-zinc-500'
                            }`}>
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
