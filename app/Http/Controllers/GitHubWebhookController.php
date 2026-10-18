<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\WorkRequestMoved;
use App\Models\PullRequest;
use App\Models\Webhook;
use App\Models\WorkRequest;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GitHubWebhookController extends Controller
{
    public function __invoke(Request $request, WorkRequestService $service): JsonResponse
    {
        $secret = config('services.github.webhook_secret')
            ?: Webhook::query()->where('name', 'github')->value('secret');

        if (! empty($secret)) {
            $signature = (string) $request->header('X-Hub-Signature-256', '');
            $expectedSignature = 'sha256='.hash_hmac('sha256', $request->getContent(), (string) $secret);

            if (! hash_equals($expectedSignature, $signature)) {
                return response()->json(['error' => 'Unauthorized: Invalid signature.'], 401);
            }
        }

        $event = (string) $request->header('X-GitHub-Event', '');
        $isPrEvent = $event === 'pull_request' || $request->has('pull_request');

        if ($isPrEvent) {
            $prData = (array) $request->input('pull_request', []);
            $action = (string) $request->input('action', 'opened');
            $prNumber = (int) ($prData['number'] ?? 0);
            $title = (string) ($prData['title'] ?? '');
            $body = (string) ($prData['body'] ?? '');
            $url = (string) ($prData['html_url'] ?? $prData['url'] ?? '');
            $branch = (string) ($prData['head']['ref'] ?? '');
            $baseRef = (string) ($prData['base']['ref'] ?? 'main');
            $isDraft = (bool) ($prData['draft'] ?? false);
            $isMerged = (bool) ($prData['merged'] ?? ($action === 'closed' && ! empty($prData['merged_at'])));
            $state = (string) ($prData['state'] ?? 'open');
            $reviewStatus = (string) ($prData['review_status'] ?? 'pending');

            $status = 'open';
            if ($isMerged) {
                $status = 'merged';
            } elseif ($action === 'closed' || $state === 'closed') {
                $status = 'closed';
            }

            $searchString = $title.' '.$body.' '.$branch;
            $linkedCount = 0;

            if (preg_match_all('/(?:fixes|closes|resolves)?\s*#?REQ-([0-9]+)/i', $searchString, $matches)) {
                $requestIds = array_unique($matches[1]);

                foreach ($requestIds as $requestId) {
                    $workRequest = WorkRequest::query()->find($requestId);
                    if (! $workRequest) {
                        continue;
                    }

                    $linkedCount++;

                    $prRecord = PullRequest::query()->updateOrCreate(
                        [
                            'work_request_id' => $workRequest->id,
                            'pr_number' => $prNumber,
                        ],
                        [
                            'provider' => 'github',
                            'title' => $title,
                            'url' => $url,
                            'status' => $status,
                            'is_draft' => $isDraft,
                            'review_status' => $reviewStatus,
                        ]
                    );

                    // If PR is merged to main (or master), advance ticket status to 'done' and log activity
                    if ($isMerged && in_array(strtolower($baseRef), ['main', 'master', ''])) {
                        $oldStatus = $workRequest->status instanceof \BackedEnum
                            ? $workRequest->status->value
                            : (string) $workRequest->status;

                        if ($oldStatus !== 'done') {
                            $workRequest->update(['status' => 'done']);

                            $workRequest->activities()->create([
                                'user_id' => null,
                                'type' => 'github_pr_merged',
                                'body' => "GitHub: Pull Request #{$prNumber} ({$title}) merged into {$baseRef}. Request marked as done.",
                                'metadata' => [
                                    'pr_number' => $prNumber,
                                    'title' => $title,
                                    'url' => $url,
                                    'base_ref' => $baseRef,
                                ],
                            ]);

                            $service->notifyRelevantUsers(
                                $workRequest,
                                'done',
                                "GitHub PR #{$prNumber} merged into {$baseRef}. Work request marked as done.",
                                null
                            );

                            $service->resolveBlockedDependencies($workRequest, null);

                            WorkRequestMoved::dispatch($workRequest, null, $oldStatus, 'done');
                        }
                    } elseif ($prRecord->wasRecentlyCreated) {
                        $workRequest->activities()->create([
                            'user_id' => null,
                            'type' => 'github_pr_linked',
                            'body' => "GitHub: Pull Request #{$prNumber} ({$title}) linked.",
                            'metadata' => [
                                'pr_number' => $prNumber,
                                'title' => $title,
                                'url' => $url,
                                'status' => $status,
                            ],
                        ]);
                    }
                }
            }

            return response()->json([
                'status' => 'success',
                'event' => 'pull_request',
                'linked' => $linkedCount,
                'merged' => $isMerged,
            ]);
        }

        $commits = (array) $request->input('commits', []);
        $linkedCount = 0;

        foreach ($commits as $commit) {
            $message = (string) ($commit['message'] ?? '');
            $commitId = (string) ($commit['id'] ?? substr(sha1($message.microtime()), 0, 7));
            $shortId = substr($commitId, 0, 7);

            if (preg_match_all('/(?:fixes|closes|resolves)\s+#?REQ-([0-9]+)/i', $message, $matches)) {
                $requestIds = array_unique($matches[1]);

                foreach ($requestIds as $requestId) {
                    $workRequest = WorkRequest::query()->find($requestId);
                    if (! $workRequest) {
                        continue;
                    }

                    $linkedCount++;

                    $statusValue = $workRequest->status instanceof \BackedEnum
                        ? $workRequest->status->value
                        : (string) $workRequest->status;

                    if ($statusValue !== 'done') {
                        $workRequest->update(['status' => 'review']);
                    }

                    $activityMessage = "GitHub: Commit {$commitId} ({$message}) linked.";
                    $workRequest->activities()->create([
                        'user_id' => null,
                        'type' => 'github_commit',
                        'body' => $activityMessage,
                        'metadata' => [
                            'commit_id' => $commitId,
                            'message' => $message,
                            'url' => $commit['url'] ?? null,
                        ],
                    ]);

                    $service->notifyRelevantUsers(
                        $workRequest,
                        'review',
                        "GitHub commit {$shortId} referenced and moved this request to review.",
                        null
                    );
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'linked' => $linkedCount,
        ]);
    }
}
