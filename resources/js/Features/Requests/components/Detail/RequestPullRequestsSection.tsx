import React from 'react';
import { LinkedPullRequest } from '@/types/workspace';
import {
    GitPullRequest,
    GitMerge,
    ExternalLink,
    CheckCircle2,
    AlertCircle,
    Clock,
    FileCode,
} from 'lucide-react';

interface RequestPullRequestsSectionProps {
    pullRequests?: LinkedPullRequest[];
    className?: string;
}

export default function RequestPullRequestsSection({
    pullRequests = [],
    className = '',
}: RequestPullRequestsSectionProps) {
    if (!pullRequests || pullRequests.length === 0) {
        return null;
    }

    const getStatusBadge = (status: string, isDraft: boolean) => {
        if (isDraft) {
            return (
                <span className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                    <FileCode className="h-3 w-3" />
                    Draft
                </span>
            );
        }

        switch (status) {
            case 'merged':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-300">
                        <GitMerge className="h-3 w-3 text-purple-400" />
                        Merged
                    </span>
                );
            case 'closed':
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-300">
                        <GitPullRequest className="h-3 w-3 text-red-400" />
                        Closed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                        <GitPullRequest className="h-3 w-3 text-emerald-400" />
                        Open
                    </span>
                );
        }
    };

    const getReviewBadge = (reviewStatus: string) => {
        switch (reviewStatus) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </span>
                );
            case 'changes_requested':
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        Changes Requested
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        Review Pending
                    </span>
                );
        }
    };

    return (
        <section
            className={`rounded-2xl border border-zinc-800 bg-[#111216] p-6 shadow-xl shadow-black/40 ${className}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-850 text-violet-400">
                        <GitPullRequest className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-100">
                            Linked Pull Requests
                        </h2>
                        <p className="text-[11px] text-zinc-400">
                            Synchronized automatically via GitHub Webhooks.
                        </p>
                    </div>
                </div>

                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 font-mono text-[11px] font-medium text-zinc-400">
                    {pullRequests.length} {pullRequests.length === 1 ? 'PR' : 'PRs'}
                </span>
            </div>

            <div className="mt-4 divide-y divide-zinc-800/60 rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                {pullRequests.map((pr) => (
                    <div
                        key={pr.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 text-xs first:rounded-t-xl last:rounded-b-xl hover:bg-zinc-850/40"
                    >
                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                                {getStatusBadge(pr.status, pr.is_draft)}
                                <span className="font-mono text-[11px] text-zinc-500">
                                    #{pr.pr_number}
                                </span>
                                <span className="truncate font-medium text-zinc-200">
                                    {pr.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 pl-1 font-mono text-[11px] text-zinc-500">
                                <span>{getReviewBadge(pr.review_status)}</span>
                                {pr.created_at && (
                                    <>
                                        <span>·</span>
                                        <span>
                                            {new Date(pr.created_at).toLocaleDateString()}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {pr.url && (
                            <a
                                href={pr.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-lg border border-zinc-700/60 bg-zinc-800/60 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
                            >
                                <span>View on GitHub</span>
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
