<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\WorkRequest;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GitHubWebhookController extends Controller
{
    public function __invoke(Request $request, WorkRequestService $service): JsonResponse
    {
        $commits = (array) $request->input('commits', []);
        $linkedCount = 0;

        foreach ($commits as $commit) {
            $message = (string) ($commit['message'] ?? '');
            $commitId = (string) ($commit['id'] ?? substr(sha1($message . microtime()), 0, 7));
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
