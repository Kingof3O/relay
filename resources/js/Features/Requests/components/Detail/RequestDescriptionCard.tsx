import Card from '@/Components/Card';
import MarkdownViewer from '@/Components/MarkdownViewer';
import TipTapEditor from '@/Components/Editor/TipTapEditor';
import { useState, useEffect } from 'react';
import { Edit3, Check } from 'lucide-react';

interface RequestDescriptionCardProps {
    description?: string | null;
    lockVersion?: number;
    canEdit: boolean;
    onUpdate: (changes: Record<string, unknown>) => Promise<void> | void;
}

export default function RequestDescriptionCard({
    description,
    lockVersion,
    canEdit,
    onUpdate,
}: RequestDescriptionCardProps) {
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [descriptionDraft, setDescriptionDraft] = useState(description ?? '');

    useEffect(() => {
        if (!isEditingDescription) {
            setDescriptionDraft(description ?? '');
        }
    }, [description, isEditingDescription]);

    const handleSave = () => {
        onUpdate({
            description: descriptionDraft,
            ...(lockVersion !== undefined ? { lock_version: lockVersion } : {}),
        });
        setIsEditingDescription(false);
    };

    const handleCancel = () => {
        setDescriptionDraft(description ?? '');
        setIsEditingDescription(false);
    };

    const handleToggleEdit = () => {
        if (isEditingDescription) {
            if (descriptionDraft !== (description ?? '')) {
                onUpdate({
                    description: descriptionDraft,
                    ...(lockVersion !== undefined ? { lock_version: lockVersion } : {}),
                });
            }
            setIsEditingDescription(false);
        } else {
            setDescriptionDraft(description ?? '');
            setIsEditingDescription(true);
        }
    };

    return (
        <Card className="p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Description & Scope
                    </h2>
                    {lockVersion && (
                        <span className="rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
                            v{lockVersion}
                        </span>
                    )}
                </div>
                {canEdit && (
                    <button
                        type="button"
                        onClick={handleToggleEdit}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                        <Edit3 className="h-3 w-3" />
                        <span>{isEditingDescription ? 'Done Editing' : 'Edit with TipTap'}</span>
                    </button>
                )}
            </div>

            {isEditingDescription && canEdit ? (
                <div className="space-y-3">
                    <TipTapEditor
                        content={descriptionDraft}
                        onChange={(val) => setDescriptionDraft(val)}
                        placeholder="Describe requirements, acceptance criteria, or type / for blocks..."
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-colors shadow-sm"
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span>Save Description</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-white/[0.04] bg-[#07090e]/40 p-4">
                    {description ? (
                        <MarkdownViewer
                            content={description}
                            onToggleChecklist={(updated) => {
                                setDescriptionDraft(updated);
                                onUpdate({
                                    description: updated,
                                    ...(lockVersion !== undefined ? { lock_version: lockVersion } : {}),
                                });
                            }}
                        />
                    ) : (
                        <p
                            onClick={() => canEdit && setIsEditingDescription(true)}
                            className="text-xs text-zinc-500 italic cursor-pointer hover:text-zinc-400"
                        >
                            No description provided. Click to add details, code blocks, or interactive checklists...
                        </p>
                    )}
                </div>
            )}
        </Card>
    );
}
