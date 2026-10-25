import { FormEvent, useEffect, useState } from 'react';
import { WorkspaceProject, WorkspaceUser } from '@/types/workspace';
import axios, { isAxiosError } from 'axios';
import { notifySuccess, notifyError } from '@/lib/toast';
import {
    X,
    UploadCloud,
    Paperclip,
    AlertCircle,
    FolderKanban,
} from 'lucide-react';

export interface SingleRequestFormProps {
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    onClose: () => void;
    onFinished: () => void;
    show?: boolean;
}

export default function SingleRequestForm({
    projects = [],
    users = [],
    onClose,
    onFinished,
    show = true,
}: SingleRequestFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [areaId, setAreaId] = useState(projects[0] ? String(projects[0].id) : '');
    const [priority, setPriority] = useState('normal');
    const [assigneeId, setAssigneeId] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [quickError, setQuickError] = useState<string | null>(null);

    useEffect(() => {
        if (projects.length > 0 && !areaId) {
            setAreaId(String(projects[0].id));
        }
    }, [projects, areaId]);

    // Clipboard paste listener to attach images directly via Cmd+V
    useEffect(() => {
        if (!show) return;

        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const newFiles: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        newFiles.push(
                            new File([blob], `screenshot-${Date.now()}.png`, { type: blob.type })
                        );
                    }
                }
            }

            if (newFiles.length > 0) {
                setFiles((prev) => [...prev, ...newFiles]);
                notifySuccess(`Attached ${newFiles.length} screenshot(s) from clipboard`);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [show]);

    const resetQuickForm = () => {
        setTitle('');
        setDescription('');
        setFiles([]);
        setAssigneeId('');
        setPriority('normal');
        setQuickError(null);
    };

    const submitQuick = async (e?: FormEvent) => {
        if (e) e.preventDefault();
        if (!title.trim() || !areaId || submitting) return;

        setSubmitting(true);
        setQuickError(null);

        try {
            const cleanDesc = description.trim()
                ? (description.includes('\n')
                      ? description.trim()
                      : description.trim().replace(/(?<=\S)\s+(\d+\.)/g, '\n$1'))
                : null;

            const payload = {
                requests: [
                    {
                        client_index: 0,
                        title: title.trim(),
                        description: cleanDesc,
                        area_id: parseInt(areaId, 10),
                        priority,
                        assignee_id: assigneeId ? parseInt(assigneeId, 10) : null,
                    },
                ],
            };

            const response = await axios.post(route('requests.bulk'), payload);
            const results = response.data.results ?? [];
            const first = results[0];

            if (first && first.success && first.request?.id) {
                // If files were attached, upload them
                if (files.length > 0) {
                    const formData = new FormData();
                    files.forEach((file) => formData.append('files[]', file));
                    try {
                        const fileRes = await axios.post(route('requests.files.store', first.request.id), formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        const fileResults: any[] = fileRes.data.results ?? [];
                        const failed = fileResults.filter((r) => !r.success);
                        if (failed.length > 0) {
                            const failDetails = failed
                                .map((f) => `${f.name}: ${Object.values(f.errors || {}).flat().join(', ')}`)
                                .join('; ');
                            notifyError('Some attachments failed to upload', failDetails);
                        }
                    } catch (fileErr) {
                        console.error('Failed to attach files to request', fileErr);
                        notifyError('Attachments could not be uploaded');
                    }
                }

                notifySuccess(
                    'Work request created',
                    `#REQ-${first.request.id}: ${title.trim().slice(0, 45)}`
                );
                resetQuickForm();
                onFinished();
                onClose();
            } else {
                const err = first?.errors ? Object.values(first.errors).flat().join(', ') : 'Failed to create request.';
                setQuickError(err);
                notifyError('Creation failed', err);
            }
        } catch (err: unknown) {
            const message = isAxiosError(err) ? (err.response?.data?.message ?? 'Could not create work request.') : 'Could not create work request.';
            setQuickError(message);
            notifyError('Creation failed', message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            submitQuick();
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Meta+Enter submits the form
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            submitQuick();
            return;
        }

        // Handle Enter key for smart list continuation
        if (e.key === 'Enter' && !e.shiftKey) {
            const textarea = e.currentTarget;
            const pos = textarea.selectionStart;
            const val = textarea.value;
            const lineStart = val.lastIndexOf('\n', pos - 1) + 1;
            const currentLine = val.slice(lineStart, pos);

            // Match numbered list: `1. ` or `1.`
            const numMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/);
            if (numMatch) {
                e.preventDefault();
                const indent = numMatch[1];
                const currentNum = parseInt(numMatch[2], 10);
                const itemText = numMatch[3];

                // If line has no text, exit the list
                if (!itemText.trim()) {
                    const before = val.slice(0, lineStart);
                    const after = val.slice(pos);
                    setDescription(`${before}${after}`);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = lineStart;
                    }, 0);
                    return;
                }

                const nextPrefix = `\n${indent}${currentNum + 1}. `;
                const before = val.slice(0, pos);
                const after = val.slice(pos);
                setDescription(`${before}${nextPrefix}${after}`);
                setTimeout(() => {
                    const newPos = pos + nextPrefix.length;
                    textarea.selectionStart = textarea.selectionEnd = newPos;
                }, 0);
                return;
            }

            // Match checklist: `- [ ] ` or `- [x] `
            const checkMatch = currentLine.match(/^(\s*)-\s*\[([ xX])?\]\s*(.*)$/);
            if (checkMatch) {
                e.preventDefault();
                const indent = checkMatch[1];
                const itemText = checkMatch[3];

                if (!itemText.trim()) {
                    const before = val.slice(0, lineStart);
                    const after = val.slice(pos);
                    setDescription(`${before}${after}`);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = lineStart;
                    }, 0);
                    return;
                }

                const nextPrefix = `\n${indent}- [ ] `;
                const before = val.slice(0, pos);
                const after = val.slice(pos);
                setDescription(`${before}${nextPrefix}${after}`);
                setTimeout(() => {
                    const newPos = pos + nextPrefix.length;
                    textarea.selectionStart = textarea.selectionEnd = newPos;
                }, 0);
                return;
            }

            // Match bullet: `- ` or `* `
            const bulletMatch = currentLine.match(/^(\s*)[-*]\s+(.*)$/);
            if (bulletMatch) {
                e.preventDefault();
                const indent = bulletMatch[1];
                const itemText = bulletMatch[2];

                if (!itemText.trim()) {
                    const before = val.slice(0, lineStart);
                    const after = val.slice(pos);
                    setDescription(`${before}${after}`);
                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = lineStart;
                    }, 0);
                    return;
                }

                const nextPrefix = `\n${indent}- `;
                const before = val.slice(0, pos);
                const after = val.slice(pos);
                setDescription(`${before}${nextPrefix}${after}`);
                setTimeout(() => {
                    const newPos = pos + nextPrefix.length;
                    textarea.selectionStart = textarea.selectionEnd = newPos;
                }, 0);
                return;
            }
        }
    };

    return (
        <form onSubmit={submitQuick} onKeyDown={handleKeyDown} className="mt-5 space-y-4">
            {quickError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 backdrop-blur-sm">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span className="flex-1 font-medium leading-relaxed">{quickError}</span>
                </div>
            )}

            {/* Title */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Request Title <span className="text-rose-400">*</span>
                </label>
                <input
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hide timer after wrong answer or reveal"
                    className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2.5 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-specular transition-all"
                />
            </div>

            {/* Project / Initiative Selection */}
            <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Project <span className="text-rose-400">*</span>
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {projects.map((proj) => {
                        const isSelected = areaId === String(proj.id);
                        return (
                            <button
                                key={proj.id}
                                type="button"
                                onClick={() => setAreaId(String(proj.id))}
                                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all text-left ${
                                    isSelected
                                        ? 'border-violet-500/50 bg-violet-500/20 text-white shadow-specular ring-1 ring-violet-500/20'
                                        : 'border-white/[0.08] bg-[#07090e]/70 text-zinc-400 hover:border-white/[0.15] hover:bg-white/[0.03] hover:text-white'
                                }`}
                            >
                                <FolderKanban className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-violet-400' : 'text-zinc-500'}`} />
                                <span className="truncate">{proj.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Priority & Assignee Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Priority Level
                    </label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                        {[
                            { id: 'urgent', label: 'Urgent', dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]' },
                            { id: 'normal', label: 'Normal', dot: 'bg-zinc-400' },
                            { id: 'low', label: 'Low', dot: 'bg-zinc-500' },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPriority(p.id)}
                                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all ${
                                    priority === p.id
                                        ? 'border-violet-500/50 bg-violet-500/20 text-white shadow-specular ring-1 ring-violet-500/20'
                                        : 'border-white/[0.08] bg-[#07090e]/80 text-zinc-400 hover:border-white/[0.15] hover:text-white'
                                }`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
                                <span>{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Assignee (Optional)
                    </label>
                    <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        className="mt-1.5 block w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs font-medium text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-specular transition-all"
                    >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} (@{user.username})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Description */}
            <div>
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Description & Details (Optional)
                    </label>
                    <div className="flex items-center gap-1.5 text-[10px]">
                        <button
                            type="button"
                            onClick={() => {
                                setDescription((prev) => (prev ? `${prev.trimEnd()}\n1. ` : '1. '));
                            }}
                            className="rounded px-1.5 py-0.5 font-mono text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors border border-white/[0.06]"
                            title="Insert numbered point"
                        >
                            1. Points
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setDescription((prev) => (prev ? `${prev.trimEnd()}\n- [ ] ` : '- [ ] '));
                            }}
                            className="rounded px-1.5 py-0.5 font-mono text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors border border-white/[0.06]"
                            title="Insert checklist task"
                        >
                            - [ ] Checklist
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setDescription((prev) => (prev ? `${prev.trimEnd()}\n- ` : '- '));
                            }}
                            className="rounded px-1.5 py-0.5 font-mono text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors border border-white/[0.06]"
                            title="Insert bullet point"
                        >
                            • Bullet
                        </button>
                    </div>
                </div>
                <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={handleDescriptionKeyDown}
                    placeholder="Describe points or checklist tasks (press Enter to auto-continue lists)..."
                    className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-specular transition-all font-sans leading-relaxed"
                />
            </div>

            {/* Attachments & Paste Box */}
            <div>
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Attachments
                    </label>
                    <span className="text-[10px] text-zinc-500">Tip: Paste screenshot with ⌘V</span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-white">
                        <UploadCloud className="h-4 w-4 text-violet-400" />
                        <input
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*,.zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx,.txt,.csv,.json,.log,.md"
                            className="hidden"
                            onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
                        />
                        <span>Upload files</span>
                    </label>

                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {files.map((file, idx) => (
                                <span
                                    key={idx}
                                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-200"
                                >
                                    <Paperclip className="h-3 w-3" />
                                    <span className="max-w-[140px] truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                                        className="ml-1 text-zinc-500 hover:text-rose-400 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Keyboard Hint and Submit Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">⌘</kbd>
                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">Enter</kbd>
                    <span className="ml-0.5 text-zinc-500">to submit</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={submitting || !title.trim() || !areaId}
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.35)] shadow-specular transition-all hover:from-violet-400 hover:to-indigo-500 active:scale-[0.98] disabled:opacity-50"
                    >
                        {submitting ? 'Creating...' : 'Create Request'}
                    </button>
                </div>
            </div>
        </form>
    );
}
