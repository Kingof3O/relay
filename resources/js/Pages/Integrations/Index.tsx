import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Bot, Mail, Activity, Layers } from 'lucide-react';
import SegmentedTabs, { TabItem } from '@/Components/SegmentedTabs';
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
                    <SegmentedTabs<'all' | 'discord' | 'email' | 'logs'>
                        tabs={[
                            { key: 'all', label: 'All Channels', icon: Layers },
                            {
                                key: 'discord',
                                label: 'Discord Webhook',
                                icon: Bot,
                                count: discord.enabled && discord.configured ? 'Live' : 'Off',
                            },
                            {
                                key: 'email',
                                label: 'Email Templates',
                                icon: Mail,
                                count: email.mailer.toUpperCase(),
                            },
                            {
                                key: 'logs',
                                label: 'Delivery Logs',
                                icon: Activity,
                                count: logs.length,
                            },
                        ]}
                        activeTab={activeTab}
                        onChange={(tab) => setActiveTab(tab)}
                    />

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
