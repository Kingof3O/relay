import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { DiscordConfig } from '../types';

interface Props {
    config: DiscordConfig;
    selectedEvent?: string;
}

export function DiscordLivePreview({ config, selectedEvent = 'created' }: Props) {
    const botName = config.bot_name || 'Relay Studio';
    const avatar = config.avatar_url;

    // Color by selectedEvent
    const borderColor = selectedEvent === 'urgent' || selectedEvent === 'blocked'
        ? '#E11D48'
        : selectedEvent === 'done'
        ? '#10B981'
        : selectedEvent === 'review'
        ? '#8B5CF6'
        : selectedEvent === 'assignment'
        ? '#0284C7'
        : '#F59E0B';

    const eventLabel = selectedEvent === 'created'
        ? '🆕 Ticket Created'
        : selectedEvent === 'assignment'
        ? '⚡ Work Assigned'
        : selectedEvent === 'review'
        ? '👀 Ready for Review'
        : selectedEvent === 'done'
        ? '✅ Ticket Completed'
        : selectedEvent === 'blocked'
        ? '🚧 Roadblock Flagged'
        : '💬 New Comment';

    return (
        <div className="rounded-xl border border-zinc-800 bg-[#090a0f] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#5865F2]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                        Live Discord Client Preview
                    </h3>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                    Channel: #engineering-alerts
                </span>
            </div>

            {/* Discord Dark Mode Container (#313338) */}
            <div className="rounded-lg bg-[#2b2d31] p-4 text-[#dbdee1] font-sans text-sm border border-[#1e1f22] select-none">
                {/* Bot Author Header */}
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
                        {avatar ? (
                            <img src={avatar} alt={botName} className="h-full w-full object-cover" />
                        ) : (
                            botName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
                            {botName}
                        </span>
                        <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            BOT
                        </span>
                        <span className="text-[11px] text-[#949ba4]">Today at 4:20 PM</span>
                    </div>
                </div>

                {/* Discord Embed Box */}
                <div
                    className="mt-2.5 rounded-md bg-[#232428] p-3 text-xs border-l-4 space-y-2 max-w-lg"
                    style={{ borderLeftColor: borderColor }}
                >
                    {/* Embed Title */}
                    <div className="flex items-center gap-1.5 font-semibold text-[#00a8fc] hover:underline cursor-pointer text-sm">
                        <span>#REQ-101: Optimize Redis caching pipeline for Kanban boards</span>
                        <ExternalLink className="h-3 w-3 inline" />
                    </div>

                    {/* Description */}
                    <p className="text-[#dbdee1] text-xs leading-relaxed">
                        Alice Admin updated #REQ-101 in Core Platform. Automatic dispatch synced across Relay Studio.
                    </p>

                    {/* Fields Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#313338]">
                        <div>
                            <span className="block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide">
                                Event
                            </span>
                            <span className="text-white font-medium">{eventLabel}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide">
                                Project
                            </span>
                            <span className="text-white font-medium">Core Platform</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide">
                                Priority
                            </span>
                            <span className="text-amber-400 font-bold">High</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide">
                                Status
                            </span>
                            <span className="text-sky-400 font-medium">In Progress</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide">
                                Assignee
                            </span>
                            <span className="text-white font-medium">Sarah Developer</span>
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold text-[#b5bac1] uppercase tracking-wide">
                                Requester
                            </span>
                            <span className="text-white font-medium">Alice Admin</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-1.5 text-[10px] text-[#949ba4] flex items-center justify-between border-t border-[#313338]">
                        <span>Relay Studio Automation Subsystem</span>
                        <span>Today at 4:20 PM</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
