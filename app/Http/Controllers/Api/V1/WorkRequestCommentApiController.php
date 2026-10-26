<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\SendRequestEmail;
use App\Models\User;
use App\Models\WorkRequest;
use App\Models\Workspace;
use App\Notifications\RequestDatabaseNotification;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

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
                'metadata' => $act->metadata,
                'is_agent' => (bool) ($act->type === 'agent_action' || ($act->metadata['is_agent'] ?? false)),
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
        $token = $author?->currentAccessToken();
        $isAgent = $request->hasHeader('X-Relay-Agent') || $request->hasHeader('X-Relay-Tool') || $token !== null;
        $toolName = (string) $request->header('X-Relay-Tool', 'relay_add_comment');
        $tokenName = $token instanceof PersonalAccessToken ? $token->name : ($token ? 'Personal Access Token' : 'Agent Session');

        $metadata = $isAgent ? [
            'is_agent' => true,
            'source' => (string) $request->header('X-Relay-Agent', 'mcp'),
            'tool' => $toolName,
            'token_name' => $tokenName,
        ] : null;

        $activity = DB::transaction(function () use ($workRequest, $author, $validated, $metadata, $isAgent, $toolName, $tokenName) {
            $act = $this->service->addComment($workRequest, $author, $validated['body'], $metadata);

            if ($isAgent) {
                // Record explicit agent_action audit trail entry
                $this->service->recordActivity(
                    $workRequest,
                    $author,
                    'agent_action',
                    "AI Agent added a discussion comment via MCP tool {$toolName}.",
                    [
                        'is_agent' => true,
                        'source' => 'mcp',
                        'tool' => $toolName,
                        'token_name' => $tokenName,
                        'comment_id' => $act->id,
                    ]
                );
            }

            // Parse @mentions using regex /@([a-zA-Z0-9_\-\.]+)/
            if (preg_match_all('/@([a-zA-Z0-9_\-\.]+)/', $validated['body'], $matches)) {
                $tokens = array_slice(array_unique($matches[1]), 0, 10);
                if (! empty($tokens)) {
                    $query = User::query()
                        ->where('active', true)
                        ->whereIn('username', $tokens)
                        ->where('id', '!=', $author->id);

                    $wsId = $workRequest->workspace_id ?? $workRequest->area?->workspace_id ?? $author->currentWorkspace()?->id;
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
