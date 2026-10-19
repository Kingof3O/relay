import React from 'react';
import { Bot, Mail, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DiscordConfig, EmailConfig, IntegrationKpiData } from '../types';
import KpiTile from '@/Components/KpiTile';

interface Props {
    discord: DiscordConfig;
    email: EmailConfig;
    kpis: IntegrationKpiData;
}

export function IntegrationKpiTiles({ discord, email, kpis }: Props) {
    const isDiscordConnected = discord.enabled && discord.configured;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Discord Webhook Status */}
            <KpiTile
                label="Discord Channel"
                value={isDiscordConnected ? 'Connected' : discord.enabled ? 'Needs URL' : 'Disabled'}
                icon={Bot}
                iconContainerClassName="bg-[#5865F2]/10 border-[#5865F2]/20 text-[#5865F2]"
                badge={
                    <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isDiscordConnected
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60'
                        }`}
                    >
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isDiscordConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                            }`}
                        />
                        {isDiscordConnected ? 'Live' : 'Standby'}
                    </span>
                }
                detail={`${discord.bot_name || 'Relay Studio'} · ${discord.masked_webhook_url || 'No webhook set'}`}
            />

            {/* Tile 2: Email Service Status */}
            <KpiTile
                label="Email Service"
                value={email.sender_name}
                icon={Mail}
                iconContainerClassName="bg-violet-500/10 border-violet-500/20 text-violet-400"
                badge={
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {email.mailer.toUpperCase()}
                    </span>
                }
                detail={<span className="font-mono">{email.from_address}</span>}
            />

            {/* Tile 3: Total Notifications Sent */}
            <KpiTile
                label="Total Notifications Sent"
                value={kpis.total_dispatches.toLocaleString()}
                icon={Send}
                badge={
                    <span className="text-xs text-zinc-400">
                        ({kpis.discord_count} Discord · {kpis.email_count} Mail)
                    </span>
                }
                detail="Email & Discord alerts sent"
            />

            {/* Tile 4: Delivery Success Rate */}
            <KpiTile
                label="Delivery Rate"
                value={`${kpis.success_rate}%`}
                valueClassName="text-emerald-400"
                icon={CheckCircle2}
                iconContainerClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                badge={
                    kpis.failed_count > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            {kpis.failed_count} failed
                        </span>
                    ) : undefined
                }
                detail={kpis.failed_count === 0 ? 'All notifications delivered' : 'Check logs for failed notifications'}
            />
        </div>
    );
}
