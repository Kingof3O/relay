import { FormEvent, useState } from 'react';
import { WorkspaceProject, WorkRequestCard } from '@/types/workspace';
import axios from 'axios';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
    X,
    Plus,
    Paperclip,
    AlertCircle,
    CheckCircle2,
    FileSpreadsheet,
    UploadCloud,
} from 'lucide-react';

export type BulkRow = {
    title: string;
    description: string;
    area_id: string;
    priority: string;
    files: File[];
};

export type BulkResult = {
    index: number;
    success: boolean;
    request?: { id: number; [key: string]: unknown };
    errors?: Record<string, string[]>;
};

export function emptyRow(projects: WorkspaceProject[]): BulkRow {
    return {
        title: '',
        description: '',
        area_id: projects[0] ? String(projects[0].id) : '',
        priority: 'normal',
        files: [],
    };
}

export interface BulkSpreadsheetFormProps {
    projects: WorkspaceProject[];
    onClose: () => void;
    onFinished: (requests?: WorkRequestCard[]) => void;
}

export default function BulkSpreadsheetForm({
    projects = [],
    onClose,
    onFinished,
}: BulkSpreadsheetFormProps) {
    const [rows, setRows] = useState<BulkRow[]>([emptyRow(projects)]);
    const [bulkResult, setBulkResult] = useState<{ created: number; failed: number } | null>(null);
    const [rowResults, setRowResults] = useState<BulkResult[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const updateRow = (index: number, values: Partial<BulkRow>) => {
        setRows((current) =>
            current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...values } : row))
        );
    };

    const submitBulk = async (event?: FormEvent) => {
        if (event) event.preventDefault();
        if (submitting || rows.length === 0) return;

        setSubmitting(true);
        setBulkResult(null);
        const results: BulkResult[] = [];

        try {
            const chunkSize = 25;
            for (let start = 0; start < rows.length; start += chunkSize) {
                const chunk = rows.slice(start, start + chunkSize).map((row, offset) => ({
                    client_index: start + offset,
                    title: row.title,
                    description: row.description,
                    area_id: row.area_id,
                    priority: row.priority,
                }));
                const response = await axios.post(route('requests.bulk'), { requests: chunk });
                results.push(...(response.data.results ?? []));
            }

            for (const item of results.filter((entry) => entry.success)) {
                const rowFiles = rows[item.index]?.files ?? [];
                if (rowFiles.length === 0 || !item.request?.id) continue;
                const formData = new FormData();
                rowFiles.forEach((file) => formData.append('files[]', file));
                await axios.post(route('requests.files.store', item.request.id), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            const failed = results.filter((entry) => !entry.success).length;
            const created = results.length - failed;
            setBulkResult({ created, failed });
            setRowResults(results);

            if (failed === 0) {
                notifySuccess(
                    'Batch creation complete',
                    `Created all ${results.length} work request(s) successfully.`
                );
                const createdRequests = results
                    .filter((entry) => entry.success && entry.request)
                    .map((entry) => entry.request as unknown as WorkRequestCard);
                onFinished(createdRequests);
                onClose();
            } else {
                notifyError(
                    'Batch completed with issues',
                    `${failed} of ${results.length} requests failed. Please inspect errors.`
                );
                setRows((current) =>
                    current.filter((_, index) => results.some((entry) => !entry.success && entry.index === index))
                );
            }
        } catch {
            setBulkResult({ created: 0, failed: rows.length });
            setRowResults(
                rows.map((_, index) => ({
                    index,
                    success: false,
                    errors: { row: ['The request could not be created.'] },
                }))
            );
            notifyError('Batch failed', 'Could not process bulk submission.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            submitBulk();
        }
    };

    return (
        <form onSubmit={submitBulk} onKeyDown={handleKeyDown} className="mt-5 space-y-4">
            {/* Matrix Header / Stats */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#07090e]/60 px-4 py-2 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-violet-400" />
                    <span className="font-medium text-zinc-300">Matrix Row Editor</span>
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                        {rows.length} {rows.length === 1 ? 'ticket' : 'tickets'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>Press <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1 py-0.5 font-mono text-[10px] text-zinc-300">⌘Enter</kbd> to submit</span>
                </div>
            </div>

            <div className="custom-scroll max-h-[50vh] space-y-3.5 overflow-y-auto pr-1.5">
                {rows.map((row, index) => {
                    const rowErrorEntry = rowResults.find((r) => r.index === index && !r.success);
                    const rowErrorMessage = rowErrorEntry?.errors
                        ? Object.values(rowErrorEntry.errors).flat().join(', ')
                        : null;

                    return (
                        <div
                            key={index}
                            className={`rounded-2xl border bg-[#07090e]/80 p-4 shadow-specular transition-all ${
                                rowErrorMessage
                                    ? 'border-rose-500/40 ring-1 ring-rose-500/20'
                                    : 'border-white/[0.08] hover:border-white/[0.15]'
                            }`}
                        >
                            <div className="mb-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-md border border-violet-500/30 bg-violet-500/10 text-[10px] font-bold text-violet-300">
                                        {index + 1}
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                        Ticket Item
                                    </span>
                                </div>
                                {rows.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setRows((cur) => cur.filter((_, rIdx) => rIdx !== index))}
                                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                        <span>Remove</span>
                                    </button>
                                )}
                            </div>

                            {rowErrorMessage && (
                                <div className="mb-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                                    <span className="font-medium leading-snug">{rowErrorMessage}</span>
                                </div>
                            )}

                            {/* Crisp Matrix Inputs */}
                            <div className="grid gap-2.5 sm:grid-cols-[1fr_170px_130px]">
                                <input
                                    required
                                    value={row.title}
                                    onChange={(e) => updateRow(index, { title: e.target.value })}
                                    placeholder="Ticket title or summary..."
                                    className="rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                                />
                                <select
                                    value={row.area_id}
                                    onChange={(e) => updateRow(index, { area_id: e.target.value })}
                                    className="rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3 py-2 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((proj) => (
                                        <option key={proj.id} value={proj.id}>
                                            {proj.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={row.priority}
                                    onChange={(e) => updateRow(index, { priority: e.target.value })}
                                    className="rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3 py-2 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                >
                                    <option value="urgent">🔴 Urgent</option>
                                    <option value="normal">🔵 Normal</option>
                                    <option value="low">⚪ Low</option>
                                </select>
                            </div>

                            <textarea
                                value={row.description}
                                onChange={(e) => updateRow(index, { description: e.target.value })}
                                placeholder="Details or acceptance criteria (optional)..."
                                rows={2}
                                className="mt-2.5 w-full rounded-xl border border-white/[0.08] bg-[#0c0d12] px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                            />

                            {/* Per-row file attachments */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-white">
                                    <UploadCloud className="h-3.5 w-3.5 text-violet-400" />
                                    <span>Attach files</span>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const newFiles = Array.from(e.target.files ?? []);
                                            if (newFiles.length > 0) {
                                                updateRow(index, { files: [...(row.files ?? []), ...newFiles] });
                                            }
                                        }}
                                    />
                                </label>

                                {row.files && row.files.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {row.files.map((file, fIdx) => (
                                            <span
                                                key={fIdx}
                                                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-200"
                                            >
                                                <Paperclip className="h-3 w-3 text-zinc-400" />
                                                <span className="max-w-[120px] truncate">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateRow(index, {
                                                            files: row.files.filter((_, i) => i !== fIdx),
                                                        })
                                                    }
                                                    className="ml-0.5 text-zinc-500 hover:text-rose-400 transition-colors"
                                                >
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Batch Creation Summary Banner */}
            {bulkResult && (
                <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#07090e]/90 p-3 text-xs text-zinc-200 shadow-specular">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>
                        Created <strong className="text-white font-semibold">{bulkResult.created}</strong> request(s) successfully.
                        {bulkResult.failed > 0 && (
                            <span className="text-rose-400 ml-1">({bulkResult.failed} failed)</span>
                        )}
                    </span>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                <button
                    type="button"
                    onClick={() => setRows((cur) => [...cur, emptyRow(projects)])}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all active:scale-[0.98]"
                >
                    <Plus className="h-3.5 w-3.5 text-violet-400" />
                    <span>Add Row</span>
                </button>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={submitting || rows.some((r) => !r.title.trim() || !r.area_id)}
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.35)] shadow-specular transition-all hover:from-violet-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50"
                    >
                        {submitting ? 'Creating...' : `Create ${rows.length} ${rows.length === 1 ? 'Ticket' : 'Tickets'}`}
                    </button>
                </div>
            </div>
        </form>
    );
}
