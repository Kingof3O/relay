import { Link } from '@inertiajs/react';
import Avatar from '@/Components/Avatar';
import Card from '@/Components/Card';
import { timeAgo } from '@/Utils/date';
import { Clock, ChevronRight, CheckCircle2 } from 'lucide-react';

export type PendingReplyIdea = {
    id: number;
    title: string;
    waiting_since: string | null;
    project: {
        id: number;
        name: string;
    } | null;
    assignee: {
        id: number;
        name: string;
    } | null;
};

export default function PendingReplyIdeasCard({
    items,
    showAssignee,
}: {
    items: PendingReplyIdea[];
    showAssignee: boolean;
}) {
    return (
        <Card className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Waiting For Reply
                    </h3>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-bold tabular-nums text-zinc-400">
                    {items.length}
                </span>
            </div>

            {items.length === 0 ? (
                <EmptyState label="Nothing is waiting on a reply" />
            ) : (
                <div className="mt-3 -mx-1.5 flex-1 space-y-1 overflow-hidden">
                    {items.map((idea) => (
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
                                <span className="text-amber-400/90 font-medium">
                                    waiting {timeAgo(idea.waiting_since).replace(' ago', '')}
                                </span>
                            }
                            avatar={showAssignee ? (idea.assignee?.name ?? null) : null}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}

export function Row({
    href,
    title,
    project,
    meta,
    avatar,
    trailing,
}: {
    href?: string;
    title: string;
    project?: string | null;
    meta?: React.ReactNode;
    avatar?: string | null;
    trailing?: React.ReactNode;
}) {
    const content = (
        <>
            {avatar !== null && avatar !== undefined ? (
                <Avatar name={avatar} />
            ) : null}

            <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                    {title}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
                    {project && (
                        <span className="max-w-[160px] truncate rounded bg-white/[0.04] px-1.5 py-0.2 font-medium text-zinc-300">
                            {project}
                        </span>
                    )}
                    {project && meta && <span className="text-zinc-600">·</span>}
                    {meta}
                </div>
            </div>

            {trailing}

            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-hover:text-zinc-300" />
        </>
    );

    const className =
        'group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-150 hover:bg-white/[0.04]';

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return <div className={className}>{content}</div>;
}

export function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-zinc-500">
            <CheckCircle2 className="h-7 w-7 text-zinc-600 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    );
}

