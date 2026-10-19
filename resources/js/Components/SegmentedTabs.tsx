import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface TabItem<T extends string = string> {
    key: T;
    label: string;
    count?: number | string;
    icon?: LucideIcon;
    disabled?: boolean;
}

export interface SegmentedTabsProps<T extends string = string> {
    tabs: TabItem<T>[];
    activeTab: T;
    onChange: (key: T) => void;
    className?: string;
}

export default function SegmentedTabs<T extends string = string>({
    tabs,
    activeTab,
    onChange,
    className = '',
}: SegmentedTabsProps<T>) {
    return (
        <nav
            role="tablist"
            className={`flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-[#111216] p-1.5 shadow-sm ${className}`.trim()}
        >
            {tabs.map((tab) => {
                const isActive = tab.key === activeTab;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        disabled={tab.disabled}
                        onClick={() => onChange(tab.key)}
                        className={
                            isActive
                                ? 'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold bg-zinc-800 text-white shadow-sm border border-zinc-700/60 transition-all'
                                : 'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-all border border-transparent'
                        }
                    >
                        {Icon && (
                            <Icon
                                className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                                    isActive ? 'text-zinc-200' : 'text-zinc-500'
                                }`}
                            />
                        )}
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count !== null && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold bg-zinc-850 border border-zinc-750 text-zinc-300">
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
