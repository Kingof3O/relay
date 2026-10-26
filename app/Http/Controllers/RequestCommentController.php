<?php

namespace App\Http\Controllers;

use App\Jobs\SendRequestEmail;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use App\Notifications\RequestDatabaseNotification;
use App\Services\WorkRequestPresenter;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class RequestCommentController extends Controller
{
    public function __construct(
        private readonly WorkRequestService $requests,
        private readonly WorkRequestPresenter $presenter,
    ) {}

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
            $tokens = array_slice(array_unique($matches[1]), 0, 10);
            if (! empty($tokens)) {
                $query = User::query()
                    ->where('active', true)
                    ->whereIn('username', $tokens)
                    ->where('id', '!=', $author->id);

                $wsId = $request->workspace_id ?? $request->area?->workspace_id ?? $author->currentWorkspace()?->id;
                if ($wsId) {
                    $query->where(function ($sub) use ($wsId) {
                        $sub->whereHas('workspaces', fn ($w) => $w->where('workspaces.id', $wsId))
                            ->orWhereHas('ownedWorkspaces', fn ($w) => $w->where('workspaces.id', $wsId));
                    });
                } elseif (Workspace::query()->exists()) {
                    $query->whereRaw('0 = 1');
                }

                $mentionedUsers = $query->limit(10)->get();

                $payload = [
                    'event' => 'mention',
                    'request_id' => $request->id,
                    'request_title' => $request->title,
                    'message' => "{$author->name} mentioned you in a comment on #REQ-{$request->id}.",
                    'url' => route('requests.show', $request),
                ];

                foreach ($mentionedUsers as $mentionedUser) {
                    $mentionedUser->notify(new RequestDatabaseNotification($payload));
                    DB::afterCommit(function () use ($mentionedUser, $payload): void {
                        SendRequestEmail::dispatch($mentionedUser->id, $payload);
                    });
                }
            }
        }

        return response()->json(['request' => $this->presenter->detail($request->fresh())]);
    }
}
