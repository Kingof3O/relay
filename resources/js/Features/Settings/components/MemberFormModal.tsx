import Modal from '@/Components/Modal';
import { WorkspaceUser } from '@/types/workspace';
import axios, { isAxiosError } from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { X, AlertCircle, Shield, User, Lock, Mail, KeyRound } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/toast';

export type RoleOption = { id: number; name: string };

export type MemberDraft = {
    name: string;
    username: string;
    email: string;
    password: string;
    role_id: string;
};

export interface MemberFormModalProps {
    show: boolean;
    onClose: () => void;
    roles: RoleOption[];
    editingMember: WorkspaceUser | null;
    onSaved: (user: WorkspaceUser, isEdit: boolean) => void;
}

export default function MemberFormModal({
    show,
    onClose,
    roles,
    editingMember,
    onSaved,
}: MemberFormModalProps) {
    const [member, setMember] = useState<MemberDraft>({
        name: '',
        username: '',
        email: '',
        password: '',
        role_id: roles[0]?.id ? String(roles[0].id) : '',
    });
    const [teamError, setTeamError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editingMember) {
            setMember({
                name: editingMember.name,
                username: editingMember.username,
                email: editingMember.email ?? '',
                password: '',
                role_id: editingMember.role_id ? String(editingMember.role_id) : (roles[0]?.id ? String(roles[0].id) : ''),
            });
        } else {
            setMember({
                name: '',
                username: '',
                email: '',
                password: '',
                role_id: roles[0]?.id ? String(roles[0].id) : '',
            });
        }
        setTeamError('');
    }, [editingMember, show, roles]);

    const submitMember = async (event: FormEvent) => {
        event.preventDefault();
        setTeamError('');
        setSubmitting(true);

        try {
            const payload = {
                ...member,
                role_id: Number(member.role_id),
                ...(member.password ? {} : { password: undefined }),
            };
            const response = editingMember
                ? await axios.patch(route('settings.team.update', editingMember.id), payload)
                : await axios.post(route('settings.team.store'), payload);
            const savedUser = response.data.user;

            notifySuccess(
                editingMember ? 'Member updated' : 'Member created',
                `${savedUser.name} (@${savedUser.username}) access configured.`
            );
            onSaved(savedUser, !!editingMember);
            onClose();
        } catch (exception: unknown) {
            const data = isAxiosError(exception) ? exception.response?.data : null;
            const errors = data?.errors;
            const errorMsg = errors
                ? Object.values(errors).flat().join(' ')
                : data?.message ?? 'Could not save this account.';
            setTeamError(errorMsg);
            notifyError('Failed to save member', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                {/* Modern Obsidian Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-specular">
                            {editingMember ? <KeyRound className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">
                                {editingMember ? `Edit ${editingMember.name}` : 'New Member Credentials'}
                            </h3>
                            <p className="mt-0.5 text-xs text-zinc-400">
                                {editingMember
                                    ? 'Leave password empty to keep existing login credentials intact.'
                                    : 'Assign a role and configure initial credentials.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                            <kbd>Esc</kbd> to close
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                            aria-label="Close modal"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Validation Alert Banner */}
                {teamError && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 backdrop-blur-sm">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        <div className="flex-1 font-medium leading-relaxed">{teamError}</div>
                    </div>
                )}

                <form onSubmit={submitMember} className="mt-5 space-y-4">
                    <div className="grid gap-3.5 sm:grid-cols-2">
                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <User className="h-3 w-3 text-zinc-500" />
                                <span>Full Name</span>
                                <span className="text-rose-400">*</span>
                            </label>
                            <input
                                required
                                placeholder="Full Name"
                                value={member.name}
                                onChange={(event) => setMember({ ...member, name: event.target.value })}
                                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <span className="text-zinc-500 font-mono">@</span>
                                <span>Username</span>
                                <span className="text-rose-400">*</span>
                            </label>
                            <input
                                required
                                placeholder="Username (e.g. jdoe)"
                                value={member.username}
                                onChange={(event) => setMember({ ...member, username: event.target.value })}
                                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all font-mono"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <Mail className="h-3 w-3 text-zinc-500" />
                                <span>Email Address</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Email Address (optional)"
                                value={member.email}
                                onChange={(event) => setMember({ ...member, email: event.target.value })}
                                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                <Lock className="h-3 w-3 text-zinc-500" />
                                <span>Password {editingMember ? '(Optional)' : ''}</span>
                                {!editingMember && <span className="text-rose-400">*</span>}
                            </label>
                            <input
                                minLength={8}
                                required={!editingMember}
                                type="password"
                                placeholder={editingMember ? 'New password (optional)' : 'Initial password'}
                                value={member.password}
                                onChange={(event) => setMember({ ...member, password: event.target.value })}
                                className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#07090e]/90 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 shadow-specular transition-all"
                            />
                        </div>
                    </div>

                    {/* Role Pill Selector with Active Highlight */}
                    <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                            Access Role <span className="text-rose-400">*</span>
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {roles.map((role) => {
                                const isSelected = member.role_id === String(role.id);
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setMember({ ...member, role_id: String(role.id) })}
                                        className={`group relative flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                                            isSelected
                                                ? 'border-cyan-500/40 bg-cyan-500/10 text-white shadow-specular ring-1 ring-cyan-500/20'
                                                : 'border-white/[0.08] bg-[#07090e]/60 text-zinc-400 hover:border-white/[0.15] hover:bg-white/[0.03] hover:text-zinc-200'
                                        }`}
                                    >
                                        <span className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-zinc-300'}`}>
                                            {role.name}
                                        </span>
                                        <span
                                            className={`h-2 w-2 rounded-full transition-all ${
                                                isSelected
                                                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                                                    : 'bg-zinc-700 group-hover:bg-zinc-600'
                                            }`}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={submitting}
                            type="submit"
                            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(6,182,212,0.35)] shadow-specular hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 transition-all"
                        >
                            {submitting
                                ? 'Saving...'
                                : editingMember
                                ? 'Save Changes'
                                : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
