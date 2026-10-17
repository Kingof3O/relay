import { useState } from 'react';
import Modal from '@/Components/Modal';
import { WorkspaceProject, WorkspaceUser } from '@/types/workspace';
import { X, Zap, FileSpreadsheet } from 'lucide-react';
import SingleRequestForm from './Create/SingleRequestForm';
import BulkSpreadsheetForm from './Create/BulkSpreadsheetForm';

export default function QuickCreateModal({
    show,
    onClose,
    projects = [],
    users = [],
    onFinished,
}: {
    show: boolean;
    onClose: () => void;
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    onFinished: () => void;
}) {
    const [mode, setMode] = useState<'quick' | 'bulk'>('quick');

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6 sm:p-7">
                {/* Header with Mode Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                                <Zap className="h-3.5 w-3.5" />
                            </span>
                            <h2 className="text-base font-bold text-white">Create Work Request</h2>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">
                            {mode === 'quick'
                                ? 'Add a single ticket in seconds with instant screenshot paste.'
                                : 'Add multiple tickets in batch matrix mode.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tab Switcher */}
                        <div className="flex rounded-xl border border-white/[0.08] bg-[#07090e] p-1 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setMode('quick')}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                    mode === 'quick'
                                        ? 'bg-violet-500/20 text-violet-300 shadow-specular'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <Zap className="h-3 w-3" />
                                <span>Quick Add</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('bulk')}
                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                    mode === 'bulk'
                                        ? 'bg-violet-500/20 text-violet-300 shadow-specular'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <FileSpreadsheet className="h-3 w-3" />
                                <span>Batch (Matrix)</span>
                            </button>
                        </div>

                        <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            <kbd>Esc</kbd>
                        </span>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                {mode === 'quick' ? (
                    <SingleRequestForm
                        show={show}
                        projects={projects}
                        users={users}
                        onClose={onClose}
                        onFinished={onFinished}
                    />
                ) : (
                    <BulkSpreadsheetForm
                        projects={projects}
                        onClose={onClose}
                        onFinished={onFinished}
                    />
                )}
            </div>
        </Modal>
    );
}
