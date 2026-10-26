<?php

namespace App\Http\Controllers;

use App\Models\RequestRelation;
use App\Models\WorkRequest;
use App\Services\WorkRequestPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RequestRelationController extends Controller
{
    public function store(
        Request $httpRequest,
        ?WorkRequest $request = null,
        ?WorkRequest $workRequest = null,
    ): JsonResponse|RedirectResponse {
        $target = $request ?? $workRequest;
        if (! $target instanceof WorkRequest) {
            abort(404);
        }

        $this->authorize('update', $target);

        $validated = $httpRequest->validate([
            'related_id' => [
                'required',
                'integer',
                'exists:requests,id',
                Rule::notIn([$target->id]),
            ],
            'type' => ['sometimes', 'string', Rule::in(['blocks', 'relates_to', 'duplicate'])],
        ]);

        $type = $validated['type'] ?? 'blocks';

        $related = WorkRequest::findOrFail($validated['related_id']);
        if ($target->workspace_id !== $related->workspace_id) {
            if ($httpRequest->expectsJson()) {
                return response()->json([
                    'message' => 'Cannot link requests from different workspaces.',
                    'error' => 'Cannot link requests from different workspaces.',
                ], 422);
            }

            return back()->withErrors(['related_id' => 'Cannot link requests from different workspaces.']);
        }

        // Circular blocking dependency prevention (including multi-hop transitive cycles)
        if ($type === 'blocks') {
            if ($this->createsCircularDependency($target->id, (int) $validated['related_id'])) {
                if ($httpRequest->expectsJson()) {
                    return response()->json([
                        'message' => "Circular dependency detected: #REQ-{$target->id} already directly or transitively blocks #REQ-{$validated['related_id']}.",
                        'error' => "Circular dependency detected: #REQ-{$target->id} already directly or transitively blocks #REQ-{$validated['related_id']}.",
                    ], 422);
                }

                return back()->withErrors(['related_id' => "Circular dependency detected: #REQ-{$target->id} already directly or transitively blocks #REQ-{$validated['related_id']}."]);
            }
        }

        $relation = DB::transaction(function () use ($target, $validated, $type): RequestRelation {
            $relation = RequestRelation::query()->firstOrCreate([
                'request_id' => $target->id,
                'related_id' => $validated['related_id'],
                'type' => $type,
            ]);

            if ($type === 'blocks') {
                $target->update([
                    'is_blocked' => true,
                    'blocked_reason' => $target->blocked_reason ?: "Blocked by #REQ-{$validated['related_id']}",
                ]);
            }

            return $relation;
        });

        if ($httpRequest->expectsJson()) {
            return response()->json([
                'success' => true,
                'relation' => $relation,
                'request' => app(WorkRequestPresenter::class)->detail($target->fresh()),
            ]);
        }

        return back();
    }

    public function destroy(
        Request $httpRequest,
        mixed $request = null,
        mixed $relation = null,
        mixed $workRequest = null,
    ): JsonResponse|RedirectResponse {
        // Resolve target WorkRequest
        $target = ($request instanceof WorkRequest) ? $request : (($workRequest instanceof WorkRequest) ? $workRequest : null);
        if ($target === null && is_numeric($request)) {
            $target = WorkRequest::query()->find($request);
        }
        if (! $target instanceof WorkRequest) {
            abort(404);
        }

        $this->authorize('update', $target);

        // Resolve relation
        $rel = $relation instanceof RequestRelation
            ? $relation
            : RequestRelation::query()->where('request_id', $target->id)->where('id', $relation)->first();

        if (! $rel) {
            // Also try finding by related_id in case relation was passed as related_id
            $rel = RequestRelation::query()->where('request_id', $target->id)->where('related_id', $relation)->first();
        }

        if ($rel) {
            DB::transaction(function () use ($target, $rel): void {
                $wasBlocking = $rel->type === 'blocks';
                $rel->delete();

                if ($wasBlocking) {
                    $remainingBlockers = RequestRelation::query()
                        ->where('request_id', $target->id)
                        ->where('type', 'blocks')
                        ->whereHas('related', function ($query) {
                            $query->where('status', '!=', 'done');
                        })
                        ->count();

                    if ($remainingBlockers === 0) {
                        $target->update([
                            'is_blocked' => false,
                            'blocked_reason' => null,
                        ]);
                    }
                }
            });
        }

        if ($httpRequest->expectsJson()) {
            return response()->json([
                'success' => true,
                'request' => app(WorkRequestPresenter::class)->detail($target->fresh()),
            ]);
        }

        return back();
    }

    /**
     * Check if candidateBlockerId is already blocked by targetId (directly or transitively).
     * If targetId directly or transitively blocks candidateBlockerId, adding candidateBlockerId
     * as a blocker of targetId would create a circular dependency.
     */
    private function createsCircularDependency(int $targetId, int $candidateBlockerId): bool
    {
        if ($targetId === $candidateBlockerId) {
            return true;
        }

        $visited = [];
        $queue = [$targetId];

        while (! empty($queue)) {
            $current = array_shift($queue);
            if (isset($visited[$current])) {
                continue;
            }
            $visited[$current] = true;

            $blockedTasks = RequestRelation::query()
                ->where('related_id', $current)
                ->where('type', 'blocks')
                ->pluck('request_id')
                ->all();

            foreach ($blockedTasks as $blockedId) {
                if ($blockedId === $candidateBlockerId) {
                    return true;
                }
                if (! isset($visited[$blockedId])) {
                    $queue[] = $blockedId;
                }
            }
        }

        return false;
    }
}
