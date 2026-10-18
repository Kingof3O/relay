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
        if ($target->workspace_id !== null && $related->workspace_id !== null && $target->workspace_id !== $related->workspace_id) {
            if ($httpRequest->expectsJson()) {
                return response()->json([
                    'message' => 'Cannot link requests from different workspaces.',
                    'error' => 'Cannot link requests from different workspaces.',
                ], 422);
            }
            return back()->withErrors(['related_id' => 'Cannot link requests from different workspaces.']);
        }

        // Circular blocking dependency prevention
        if ($type === 'blocks') {
            $isReverseBlocker = RequestRelation::query()
                ->where('request_id', $validated['related_id'])
                ->where('related_id', $target->id)
                ->where('type', 'blocks')
                ->exists();

            if ($isReverseBlocker) {
                if ($httpRequest->expectsJson()) {
                    return response()->json([
                        'message' => "Circular dependency detected: #REQ-{$target->id} already blocks #REQ-{$validated['related_id']}.",
                        'error' => "Circular dependency detected: #REQ-{$target->id} already blocks #REQ-{$validated['related_id']}.",
                    ], 422);
                }
                return back()->withErrors(['related_id' => "Circular dependency detected: #REQ-{$target->id} already blocks #REQ-{$validated['related_id']}."]);
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
}
