import React, { useState } from 'react';
import { WorkspaceUser } from '@/types/workspace';
import { Check, X, ArrowRightLeft, UserCheck, Flame, Loader2 } from 'lucide-react';

interface BulkActionBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onBulkUpdateStatus: (status: string) => Promise<void>;
    onBulkUpdatePriority: (priority: string) => Promise<void>;
    onBulkUpdateAssignee: (assigneeId: number | null) => Promise<void>;
    users: WorkspaceUser[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
}

export default function BulkActionBar({
    selectedCount,
    onClearSelection,
    onBulkUpdateStatus,
    onBulkUpdatePriority,
    onBulkUpdateAssignee,
    users,
    statuses,
    priorities,
}: BulkActionBarProps) {
    const [loading, setLoading] = useState(false);

    if (selectedCount === 0) return null;

    const handleAction = async (fn: () => Promise<void>) => {
        setLoading(true);
        try {
            await fn();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 animate-in slide-in-from-bottom-5 duration-200 pointer-events-none">
            <div className="pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl border border-zinc-750 bg-[#121318]/95 px-4 py-2.5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 text-xs text-zinc-200">
                {/* Count Pill */}
                <div className="flex items-center gap-2 pr-2 border-r border-zinc-800">
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold font-mono text-zinc-950 px-1.5">
                        {selectedCount}
                    </span>
                    <span className="font-semibold text-zinc-100">Selected</span>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 px-3 py-1 text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin text-zinc-200" />
                        <span>Updating...</span>
                    </div>
                ) : (
                    <>
                        {/* Status Dropdown */}
                        <div className="flex items-center gap-1.5">
                            <ArrowRightLeft className="h-3.5 w-3.5 text-zinc-400" />
                            <select
                                defaultValue=""
                                onChange={(e) => {
                                    if (e.target.value) handleAction(() => onBulkUpdateStatus(e.target.value));
                                }}
                                className="rounded-lg border border-zinc-700 bg-zinc-850 px-2 py-1 text-xs text-zinc-200 focus:ring-0 focus:border-zinc-500 cursor-pointer"
                            >
                                <option value="" disabled>
                                    Move status...
                                </option>
                                {Object.entries(statuses).map(([val, label]) => (
                                    <option key={val} value={val}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Priority Dropdown */}
                        <div className="flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5 text-zinc-400" />
                            <select
                                defaultValue=""
                                onChange={(e) => {
                                    if (e.target.value) handleAction(() => onBulkUpdatePriority(e.target.value));
                                }}
                                className="rounded-lg border border-zinc-700 bg-zinc-850 px-2 py-1 text-xs text-zinc-200 focus:ring-0 focus:border-zinc-500 cursor-pointer"
                            >
                                <option value="" disabled>
                                    Set priority...
                                </option>
                                {Object.entries(priorities).map(([val, label]) => (
                                    <option key={val} value={val}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Assignee Dropdown */}
                        <div className="flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                            <select
                                defaultValue=""
                                onChange={(e) => {
                                    if (e.target.value !== '') {
                                        const val = e.target.value === 'null' ? null : Number(e.target.value);
                                        handleAction(() => onBulkUpdateAssignee(val));
                                    }
                                }}
                                className="rounded-lg border border-zinc-700 bg-zinc-850 px-2 py-1 text-xs text-zinc-200 focus:ring-0 focus:border-zinc-500 cursor-pointer"
                            >
                                <option value="" disabled>
                                    Assign to...
                                </option>
                                <option value="null">Unassigned</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* Deselect All */}
                <div className="pl-2 border-l border-zinc-800">
                    <button
                        type="button"
                        onClick={onClearSelection}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        title="Deselect all (Esc)"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
