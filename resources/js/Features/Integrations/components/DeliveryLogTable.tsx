import React, { useState } from 'react';
import { Bot, Mail, CheckCircle2, XCircle, Clock, Activity, Search } from 'lucide-react';
import type { DeliveryLogItem } from '../types';

interface Props {
    logs: DeliveryLogItem[];
}

export function DeliveryLogTable({ logs }: Props) {
    const [channelFilter, setChannelFilter] = useState<'all' | 'discord' | 'email'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = logs.filter((log) => {
        if (channelFilter !== 'all' && log.channel !== channelFilter) return false;
        if (statusFilter !== 'all' && log.status !== statusFilter) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchSummary = (log.summary || '').toLowerCase().includes(term);
            const matchTarget = (log.target || '').toLowerCase().includes(term);
            const matchEvent = log.event.toLowerCase().includes(term);
            if (!matchSummary && !matchTarget && !matchEvent) return false;
        }
        return true;
    });

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#0c0d12] p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4 text-zinc-200" />
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">
                            Real-Time Notification Delivery Logs
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Inspection history for both Discord webhooks and outgoing email dispatches.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search logs..."
                            className="w-40 sm:w-48 rounded-lg border border-zinc-800 bg-[#090a0f] pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                        />
                    </div>

                    {/* Channel Pills */}
                    <div className="flex items-center rounded-lg border border-zinc-800 bg-[#090a0f] p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setChannelFilter('all')}
                            className={`px-2.5 py-1 rounded font-medium transition-all ${
                                channelFilter === 'all'
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            All Channels
                        </button>
                        <button
                            type="button"
                            onClick={() => setChannelFilter('discord')}
                            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                                channelFilter === 'discord'
                                    ? 'bg-[#5865F2]/20 text-[#5865F2]'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Bot className="h-3 w-3" />
                            Discord
                        </button>
                        <button
                            type="button"
                            onClick={() => setChannelFilter('email')}
                            className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                                channelFilter === 'email'
                                    ? 'bg-violet-500/20 text-violet-300'
                                    : 'text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <Mail className="h-3 w-3" />
                            Email
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-800/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 bg-[#090a0f]">
                            <th className="py-2.5 px-3">Timestamp</th>
                            <th className="py-2.5 px-3">Channel</th>
                            <th className="py-2.5 px-3">Event</th>
                            <th className="py-2.5 px-3">Target Destination</th>
                            <th className="py-2.5 px-3">Summary</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-zinc-500">
                                    No notification logs match your current filter criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                                        {log.created_human}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                        {log.channel === 'discord' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20">
                                                <Bot className="h-3 w-3" />
                                                Discord
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                                <Mail className="h-3 w-3" />
                                                Email
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-300 whitespace-nowrap">
                                        {log.event}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-400 truncate max-w-[200px]">
                                        {log.target || '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-zinc-300 truncate max-w-[320px]">
                                        <span>{log.summary || '—'}</span>
                                        {log.error_message && (
                                            <p className="text-[10px] text-rose-400 truncate mt-0.5">
                                                {log.error_message}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                        {log.status === 'success' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Delivered
                                            </span>
                                        ) : log.status === 'queued' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                <Clock className="h-3 w-3" />
                                                Queued
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                <XCircle className="h-3 w-3" />
                                                Failed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
