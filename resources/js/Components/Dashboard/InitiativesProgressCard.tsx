import Card from '@/Components/Card';
import { Link } from '@inertiajs/react';
import { ArrowRight, FolderKanban } from 'lucide-react';
import { ProjectStat } from './types';

interface InitiativesProgressCardProps {
    projectStats?: ProjectStat[];
    className?: string;
}

export default function InitiativesProgressCard({
    projectStats = [],
    className = 'p-5 lg:col-span-5',
}: InitiativesProgressCardProps) {
    return (
        <Card className={className} hoverable>
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                        <FolderKanban className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-100">Initiatives Progress</h3>
                        <p className="text-xs text-zinc-500">Delivery status across projects</p>
                    </div>
                </div>
                <Link
                    href={route('settings.index')}
                    className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-white"
                >
                    <span>Manage ({projectStats.length})</span>
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            <div className="mt-4 space-y-2.5">
                {projectStats.length > 0 ? (
                    projectStats.slice(0, 5).map((project) => (
                        <Link
                            key={project.id}
                            href={route('requests.index', { project: project.slug })}
                            className="group block rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
                        >
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: project.color }}
                                    />
                                    <span className="font-medium text-zinc-200 transition-colors group-hover:text-white">
                                        {project.name}
                                    </span>
                                    {project.blocked > 0 && (
                                        <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/20">
                                            {project.blocked} blocked
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                                    <span>
                                        {project.done}/{project.total}
                                    </span>
                                    <span className="font-semibold text-zinc-200">{project.percentage}%</span>
                                </div>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${project.percentage}%`,
                                        backgroundColor: project.color,
                                    }}
                                />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex h-32 items-center justify-center text-xs text-zinc-500">
                        No active initiatives found.
                    </div>
                )}
            </div>
        </Card>
    );
}
