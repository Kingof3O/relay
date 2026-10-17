import Card from '@/Components/Card';
import { Row, EmptyState } from '@/Components/Dashboard/PendingReplyIdeasCard';
import { timeAgo } from '@/Utils/date';
import { CheckSquare, Square } from 'lucide-react';

export type OpenTaskItem = {
    id: number;
    title: string;
    created_at: string | null;
    idea: {
        id: number;
        title: string;
        project: {
            id: number;
            name: string;
        } | null;
        assignee: {
            id: number;
            name: string;
        } | null;
    } | null;
};

export default function OpenTasksCard({
    items,
    showAssignee,
}: {
    items: OpenTaskItem[];
    showAssignee: boolean;
}) {
    return (
        <Card className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Open Tasks
                    </h3>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] px-1.5 text-[10px] font-bold tabular-nums text-zinc-400">
                    {items.length}
                </span>
            </div>

            {items.length === 0 ? (
                <EmptyState label="No open tasks remaining" />
            ) : (
                <div className="mt-3 -mx-1.5 flex-1 space-y-1 overflow-hidden">
                    {items.map((task) => (
                        <Row
                            key={task.id}
                            href={
                                task.idea?.project
                                    ? route('projects.ideas.show', [
                                          task.idea.project.id,
                                          task.idea.id,
                                      ])
                                    : undefined
                            }
                            title={task.title}
                            project={task.idea?.project?.name}
                            meta={<span>added {timeAgo(task.created_at)}</span>}
                            avatar={showAssignee ? (task.idea?.assignee?.name ?? null) : null}
                            trailing={
                                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/[0.04]" />
                            }
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}

