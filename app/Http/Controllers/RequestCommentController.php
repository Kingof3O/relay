<?php

namespace App\Http\Controllers;

use App\Jobs\SendRequestEmail;
use App\Models\User;
use App\Models\WorkRequest;
use App\Notifications\RequestDatabaseNotification;
use App\Services\WorkRequestPresenter;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RequestCommentController extends Controller
{
    public function __construct(
        private readonly WorkRequestService $requests,
        private readonly WorkRequestPresenter $presenter,
    ) {
    }

    public function store(Request $httpRequest, WorkRequest $request): JsonResponse
    {
        $this->authorize('comment', $request);
        $validated = $httpRequest->validate([
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $author = $httpRequest->user();
        $this->requests->addComment($request, $author, $validated['body']);

        // Parse @mentions using regex /@([a-zA-Z0-9_\-\.]+)/
        if (preg_match_all('/@([a-zA-Z0-9_\-\.]+)/', $validated['body'], $matches)) {
            $tokens = array_unique($matches[1]);
            if (!empty($tokens)) {
                $mentionedUsers = User::query()
                    ->whereIn('username', $tokens)
                    ->orWhereIn('name', $tokens)
                    ->get()
                    ->filter(fn (User $user): bool => $user->id !== $author->id)
                    ->unique('id');

                $payload = [
                    'event' => 'mention',
                    'request_id' => $request->id,
                    'request_title' => $request->title,
                    'message' => "{$author->name} mentioned you in a comment on #REQ-{$request->id}.",
                    'url' => route('requests.show', $request),
                ];

                foreach ($mentionedUsers as $mentionedUser) {
                    $mentionedUser->notify(new RequestDatabaseNotification($payload));
                    SendRequestEmail::dispatch($mentionedUser->id, $payload);
                }
            }
        }

        return response()->json(['request' => $this->presenter->detail($request->fresh())]);
    }
}
