import React from 'react';
import { Bot, Mail, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DiscordConfig, EmailConfig, IntegrationKpiData } from '../types';

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
            <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Discord Channel
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
                        <Bot className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold tracking-tight text-white">
                        {isDiscordConnected ? 'Connected' : discord.enabled ? 'Needs URL' : 'Disabled'}
                    </span>
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
                </div>
                <p className="mt-1 text-xs text-zinc-500 truncate">
                    {discord.bot_name || 'Relay Studio'} · {discord.masked_webhook_url || 'No webhook set'}
                </p>
            </div>

            {/* Tile 2: Email Dispatch Status */}
            <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Email Dispatch
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                        <Mail className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold tracking-tight text-white">
                        {email.sender_name}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {email.mailer.toUpperCase()}
                    </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 truncate font-mono">
                    {email.from_address}
                </p>
            </div>

            {/* Tile 3: Total Dispatches */}
            <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Total Dispatches
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <Send className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold tracking-tight text-white">
                        {kpis.total_dispatches.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400">
                        ({kpis.discord_count} Discord · {kpis.email_count} Mail)
                    </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                    Dual pipeline automated alerts
                </p>
            </div>

            {/* Tile 4: Delivery Success Rate */}
            <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-4 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Success Velocity
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold tracking-tight text-emerald-400">
                        {kpis.success_rate}%
                    </span>
                    {kpis.failed_count > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                            <AlertTriangle className="h-3 w-3" />
                            {kpis.failed_count} failed
                        </span>
                    )}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                    {kpis.failed_count === 0 ? 'Zero delivery failures' : 'Check logs for failed payloads'}
                </p>
            </div>
        </div>
    );
}
