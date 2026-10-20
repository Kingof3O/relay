<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\SendRequestEmail;
use App\Models\User;
use App\Models\WorkRequest;
use App\Notifications\RequestDatabaseNotification;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class WorkRequestCommentApiController extends Controller
{
    public function __construct(
        private readonly WorkRequestService $service,
    ) {}

    public function index(Request $request, int $id): JsonResponse
    {
        $workRequest = WorkRequest::findOrFail($id);

        $this->authorize('view', $workRequest);

        $comments = $workRequest->activities()
            ->where('type', 'comment')
            ->with('user')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($act): array => [
                'id' => $act->id,
                'body' => $act->body,
                'created_at' => $act->created_at?->toIso8601String(),
                'user' => $act->user ? [
                    'id' => $act->user->id,
                    'name' => $act->user->name,
                    'username' => $act->user->username,
                ] : null,
            ]);

        return response()->json([
            'request_id' => $workRequest->id,
            'comments' => $comments,
        ]);
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $workRequest = WorkRequest::findOrFail($id);

        $this->authorize('comment', $workRequest);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $author = $request->user();

        $activity = DB::transaction(function () use ($workRequest, $author, $validated) {
            $act = $this->service->addComment($workRequest, $author, $validated['body']);

            // Parse @mentions using regex /@([a-zA-Z0-9_\-\.]+)/
            if (preg_match_all('/@([a-zA-Z0-9_\-\.]+)/', $validated['body'], $matches)) {
                $tokens = array_slice(array_unique($matches[1]), 0, 10);
                if (! empty($tokens)) {
                    $mentionedUsers = User::query()
                        ->where('active', true)
                        ->whereIn('username', $tokens)
                        ->where('id', '!=', $author->id)
                        ->limit(10)
                        ->get();

                    $payload = [
                        'event' => 'mention',
                        'request_id' => $workRequest->id,
                        'request_title' => $workRequest->title,
                        'message' => "{$author->name} mentioned you in a comment on #REQ-{$workRequest->id}.",
                        'url' => route('requests.show', $workRequest),
                    ];

                    foreach ($mentionedUsers as $mentionedUser) {
                        $mentionedUser->notify(new RequestDatabaseNotification($payload));
                        DB::afterCommit(function () use ($mentionedUser, $payload): void {
                            SendRequestEmail::dispatch($mentionedUser->id, $payload);
                        });
                    }
                }
            }

            return $act;
        });

        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => [
                'id' => $activity->id,
                'body' => $activity->body,
                'created_at' => $activity->created_at?->toIso8601String(),
                'user' => [
                    'id' => $author->id,
                    'name' => $author->name,
                    'username' => $author->username,
                ],
            ],
        ], 201);
    }
}
