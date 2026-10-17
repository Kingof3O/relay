import Card from '@/Components/Card';
import { RequestActivityItem, WorkspaceUser } from '@/types/workspace';
import { usePage } from '@inertiajs/react';
import { FormEvent, useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { MessageSquare, Send, AtSign } from 'lucide-react';

interface RequestDiscussionSectionProps {
    activities: RequestActivityItem[];
    canComment: boolean;
    saving: boolean;
    onAddComment: (comment: string) => Promise<void> | void;
    users?: WorkspaceUser[];
}

const dateLabel = (date?: string | null) =>
    date
        ? new Intl.DateTimeFormat(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(new Date(date))
        : '';

function activityLabel(type: string) {
    return type.replaceAll('_', ' ');
}

// Render text and highlight @mentions with glowing violet pill badge
function renderCommentBody(text: string) {
    const parts = text.split(/(@[a-zA-Z0-9_\-\.]+)/g);

    return parts.map((part, index) => {
        if (part.startsWith('@') && part.length > 1) {
            return (
                <span
                    key={index}
                    className="inline-flex items-center bg-violet-500/10 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 rounded font-mono text-xs font-semibold mx-0.5 shadow-sm shadow-violet-500/10"
                >
                    {part}
                </span>
            );
        }
        return part;
    });
}

export default function RequestDiscussionSection({
    activities,
    canComment,
    saving,
    onAddComment,
    users: propUsers,
}: RequestDiscussionSectionProps) {
    const pageProps = usePage().props as { users?: WorkspaceUser[] };
    const users = propUsers || pageProps.users || [];

    const [comment, setComment] = useState('');
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionIndex, setMentionIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Filter team members based on mention query
    const filteredUsers = users.filter((u) => {
        const q = mentionQuery.toLowerCase();
        return (
            u.username.toLowerCase().includes(q) ||
            u.name.toLowerCase().includes(q)
        );
    });

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const cursor = e.target.selectionStart || 0;
        setComment(value);

        // Check if cursor is right after an '@' mention token
        const textBeforeCursor = value.slice(0, cursor);
        const match = textBeforeCursor.match(/@([a-zA-Z0-9_\-\.]*)$/);

        if (match) {
            setMentionOpen(true);
            setMentionQuery(match[1]);
            setMentionIndex(0);
        } else {
            setMentionOpen(false);
        }
    };

    const insertMention = (selectedUser: WorkspaceUser) => {
        const cursor = textareaRef.current?.selectionStart || comment.length;
        const textBeforeCursor = comment.slice(0, cursor);
        const textAfterCursor = comment.slice(cursor);

        const match = textBeforeCursor.match(/@([a-zA-Z0-9_\-\.]*)$/);
        if (match) {
            const prefix = textBeforeCursor.slice(0, match.index);
            const insertion = `@${selectedUser.username} `;
            const newComment = `${prefix}${insertion}${textAfterCursor}`;
            setComment(newComment);
            setMentionOpen(false);

            setTimeout(() => {
                if (textareaRef.current) {
                    const newCursor = (match.index || 0) + insertion.length;
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(newCursor, newCursor);
                }
            }, 0);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!mentionOpen || filteredUsers.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setMentionIndex((prev) => (prev + 1) % filteredUsers.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setMentionIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            e.preventDefault();
            insertMention(filteredUsers[mentionIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setMentionOpen(false);
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!comment.trim() || saving) return;
        const body = comment;
        setComment('');
        setMentionOpen(false);
        await onAddComment(body);
    };

    return (
        <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Activity & Discussion
                    </h2>
                </div>
                <span className="text-[11px] text-zinc-500">
                    {activities.length} event{activities.length === 1 ? '' : 's'}
                </span>
            </div>

            {canComment && (
                <div className="relative mt-4">
                    {/* Autocomplete Mention Popover */}
                    {mentionOpen && filteredUsers.length > 0 && (
                        <div className="absolute bottom-full mb-2 left-0 w-72 max-h-56 overflow-y-auto rounded-xl border border-white/[0.12] bg-[#0d1322]/95 backdrop-blur-xl shadow-2xl p-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-100">
                            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400 border-b border-white/[0.06] mb-1">
                                <AtSign className="h-3 w-3" />
                                <span>Mention Team Member</span>
                            </div>
                            {filteredUsers.map((u, idx) => (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => insertMention(u)}
                                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                                        idx === mentionIndex
                                            ? 'bg-violet-500/20 text-white'
                                            : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                >
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
                                        {(u.name || u.username).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-xs font-medium text-zinc-200">
                                            {u.name}
                                        </div>
                                        <div className="truncate font-mono text-[10px] text-zinc-400">
                                            @{u.username}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <textarea
                            ref={textareaRef}
                            value={comment}
                            onChange={handleTextChange}
                            onKeyDown={handleKeyDown}
                            rows={2}
                            placeholder="Add a comment or update (type @ to mention someone)…"
                            className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#07090e]/90 p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <button
                            disabled={saving || !comment.trim()}
                            type="submit"
                            className="flex items-center gap-1.5 self-end rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(139,92,246,0.35)] shadow-specular transition-all hover:from-violet-400 hover:to-indigo-500 disabled:opacity-40"
                        >
                            <Send className="h-3 w-3" />
                            <span>Send</span>
                        </button>
                    </form>
                </div>
            )}

            {activities.length ? (
                <div className="mt-5 divide-y divide-white/[0.04]">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3 py-3.5 first:pt-0">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
                                {(activity.user?.name ?? 'S').charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-baseline gap-2">
                                    <span className="text-xs font-bold text-zinc-200">
                                        {activity.user?.name ?? 'System'}
                                    </span>
                                    {activity.user?.username && (
                                        <span className="font-mono text-[10px] text-zinc-500">
                                            @{activity.user.username}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-zinc-500">
                                        {dateLabel(activity.created_at)}
                                    </span>
                                </div>
                                {activity.type === 'comment' ? (
                                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">
                                        {renderCommentBody(activity.body || '')}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-zinc-400">
                                        {activity.body || activityLabel(activity.type)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-8 text-center text-xs text-zinc-600">
                    No activity recorded yet.
                </div>
            )}
        </Card>
    );
}
