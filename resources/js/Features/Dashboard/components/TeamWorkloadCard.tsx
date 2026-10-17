import Card from '@/Components/Card';
import { Users } from 'lucide-react';
import { TeamMemberWorkload } from '../types';

interface TeamWorkloadCardProps {
    teamWorkload?: TeamMemberWorkload[];
    className?: string;
}

export default function TeamWorkloadCard({
    teamWorkload = [],
    className = 'p-4',
}: TeamWorkloadCardProps) {
    return (
        <Card className={className} hoverable>
            <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-zinc-300">
                        <Users className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            Squad Capacity
                        </p>
                        <h2 className="text-xs font-semibold text-zinc-100">Team Workload Distribution</h2>
                    </div>
                </div>
                <span className="rounded-md border border-zinc-800 bg-zinc-850 px-2 py-0.5 text-xs font-medium text-zinc-400">
                    {teamWorkload.length} Members
                </span>
            </div>

            {teamWorkload.length > 0 ? (
                <div className="mt-3 divide-y divide-zinc-800/60">
                    {teamWorkload.slice(0, 5).map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center justify-between py-2.5 px-2 transition-colors hover:bg-zinc-850/40 rounded-lg"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-[10px] font-semibold text-zinc-200">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-200">{member.name}</p>
                                    <p className="text-[10px] text-zinc-500">{member.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1 text-zinc-400">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                                    {member.active} active
                                </span>
                                <span className="flex items-center gap-1 text-amber-400/90">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    {member.review} review
                                </span>
                                <span className="flex items-center gap-1 text-emerald-400/90">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    {member.done} done
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-xs font-normal text-zinc-500">No active team members.</p>
                </div>
            )}
        </Card>
    );
}
