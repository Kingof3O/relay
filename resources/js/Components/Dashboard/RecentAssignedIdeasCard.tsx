import Card from '@/Components/Card';
import { Row, EmptyState } from '@/Components/Dashboard/PendingReplyIdeasCard';
import { statusMeta } from '@/Utils/status';
import { timeAgo } from '@/Utils/date';
import { Target, Sparkles } from 'lucide-react';

export type RecentAssignedIdea = {
    id: number;
    title: string;
    status: string;
    progress: number;
    last_reply_at: string | null;
    project: {
        id: number;
        name: string;
    } | null;
};

export default function RecentAssignedIdeasCard({
    items,
}: {
    items: RecentAssignedIdea[];
}) {
    return (
        <Card className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-violet-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Assigned To You
                    </h3>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-bold tabular-nums text-zinc-400">
                    {items.length}
                </span>
            </div>

            {items.length === 0 ? (
                <EmptyState label="Nothing is assigned to you yet" />
            ) : (
                <div className="mt-3 -mx-1.5 flex-1 space-y-1 overflow-hidden">
                    {items.map((idea) => {
                        const meta = statusMeta(idea.status);

                        return (
                            <Row
                                key={idea.id}
                                href={
                                    idea.project
                                        ? route('projects.ideas.show', [idea.project.id, idea.id])
                                        : undefined
                                }
                                title={idea.title}
                                project={idea.project?.name}
                                meta={
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]`}
                                            style={{ backgroundColor: meta.hex, color: meta.hex }}
                                        />
                                        <span className={meta.text}>{meta.label}</span>
                                    </span>
                                }
                                trailing={
                                    <div className="hidden w-24 flex-shrink-0 sm:block">
                                        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                                                style={{ width: `${Math.min(100, Math.max(0, idea.progress))}%` }}
                                            />
                                        </div>
                                        <span className="mt-1 block text-right text-[10px] font-bold tabular-nums text-zinc-400">
                                            {idea.progress}%
                                        </span>
                                    </div>
                                }
                            />
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

