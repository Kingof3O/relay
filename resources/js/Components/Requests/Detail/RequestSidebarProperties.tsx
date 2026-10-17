import Card from '@/Components/Card';
import { WorkspaceProject, WorkspaceUser, WorkRequestDetail } from '@/types/workspace';
import { Sliders } from 'lucide-react';

interface RequestSidebarPropertiesProps {
    request: WorkRequestDetail;
    projects: WorkspaceProject[];
    users: WorkspaceUser[];
    statuses: Record<string, string>;
    priorities: Record<string, string>;
    canAssign: boolean;
    canEdit: boolean;
    onUpdate: (changes: Record<string, unknown>) => Promise<void> | void;
}

export default function RequestSidebarProperties({
    request,
    projects,
    users,
    statuses,
    priorities,
    canAssign,
    canEdit,
    onUpdate,
}: RequestSidebarPropertiesProps) {
    return (
        <aside className="space-y-4">
            <Card className="space-y-4 p-5">
                <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                    <Sliders className="h-3.5 w-3.5 text-violet-400" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Properties
                    </h2>
                </div>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Status
                    </span>
                    <select
                        disabled={!canEdit}
                        value={request.status}
                        onChange={(event) => onUpdate({ status: event.target.value })}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        {Object.entries(statuses).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Priority
                    </span>
                    <select
                        disabled={!canEdit}
                        value={request.priority}
                        onChange={(event) => onUpdate({ priority: event.target.value })}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        {Object.entries(priorities).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Project
                    </span>
                    <select
                        disabled={!canEdit}
                        value={request.project?.id ?? ''}
                        onChange={(event) => onUpdate({ area_id: Number(event.target.value) })}
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-zinc-400">
                        Assignee
                    </span>
                    <select
                        disabled={!canAssign}
                        value={request.assignee?.id ?? ''}
                        onChange={(event) =>
                            onUpdate({
                                assignee_id: event.target.value ? Number(event.target.value) : null,
                            })
                        }
                        className="w-full rounded-xl border border-white/[0.08] bg-[#07090e] px-3 py-2 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                    >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                </label>
            </Card>

            {/* Blocked Status Callout Panel */}
            <Card className="p-5">
                <label
                    className={`flex items-start gap-3 ${canEdit ? 'cursor-pointer select-none' : ''}`}
                >
                    <input
                        type="checkbox"
                        disabled={!canEdit}
                        checked={request.is_blocked}
                        onChange={(event) =>
                            onUpdate({
                                is_blocked: event.target.checked,
                                blocked_reason: event.target.checked ? request.blocked_reason : null,
                            })
                        }
                        className="mt-0.5 h-4 w-4 rounded border-white/10 bg-[#07090e] text-rose-600 focus:ring-0 disabled:opacity-50"
                    >
                    </input>
                    <div>
                        <span className="block text-xs font-bold text-white">Roadblock / Blocked</span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500">
                            Flag this request as blocked and document the blocker reason.
                        </span>
                    </div>
                </label>

                {request.is_blocked && canEdit && (
                    <textarea
                        defaultValue={request.blocked_reason ?? ''}
                        onBlur={(event) => {
                            if (event.target.value !== (request.blocked_reason ?? '')) {
                                onUpdate({ blocked_reason: event.target.value });
                            }
                        }}
                        rows={3}
                        placeholder="Explain why work is blocked…"
                        className="mt-3 w-full rounded-xl border border-rose-500/30 bg-[#07090e] p-2.5 text-xs text-rose-200 placeholder:text-zinc-600 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                )}
            </Card>
        </aside>
    );
}
