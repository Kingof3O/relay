<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\WorkRequest;
use App\Services\WorkRequestPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class SubtaskController extends Controller
{
    public function __construct(
        private readonly WorkRequestPresenter $presenter,
    ) {}

    public function store(Request $request, WorkRequest $workRequest): JsonResponse|RedirectResponse
    {
        $this->authorize('update', $workRequest);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'assignee_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'story_points' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $subtask = WorkRequest::query()->create([
            'workspace_id' => $workRequest->workspace_id,
            'area_id' => $workRequest->area_id,
            'parent_id' => $workRequest->id,
            'cycle_id' => $workRequest->cycle_id,
            'title' => $validated['title'],
            'status' => 'new',
            'priority' => 'normal',
            'story_points' => $validated['story_points'] ?? null,
            'requester_id' => $request->user()->id,
            'assignee_id' => $validated['assignee_id'] ?? null,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'subtask' => $this->presenter->card($subtask),
                'request' => $this->presenter->detail($workRequest->fresh(['subtasks.assignee'])),
            ], 201);
        }

        return back()->with('success', 'Sub-task created.');
    }

    public function toggle(Request $request, WorkRequest $workRequest, WorkRequest $subtask): JsonResponse|RedirectResponse
    {
        if ($subtask->parent_id !== $workRequest->id) {
            abort(404, 'Subtask does not belong to this parent request.');
        }

        $this->authorize('changeStatus', $subtask);

        $currentStatus = $subtask->status?->value ?? (string) $subtask->getRawOriginal('status');
        $newStatus = $currentStatus === 'done' ? 'ready' : 'done';

        $subtask->update(['status' => $newStatus]);

        if ($request->expectsJson()) {
            return response()->json([
                'subtask' => $this->presenter->card($subtask->fresh()),
                'request' => $this->presenter->detail($workRequest->fresh(['subtasks.assignee'])),
            ]);
        }

        return back();
    }

    public function destroy(Request $request, WorkRequest $workRequest, WorkRequest $subtask): JsonResponse|RedirectResponse
    {
        if ($subtask->parent_id !== $workRequest->id) {
            abort(404, 'Subtask does not belong to this parent request.');
        }

        $this->authorize('delete', $subtask);

        $subtask->delete();

        if ($request->expectsJson()) {
            return response()->json([
                'deleted' => true,
                'request' => $this->presenter->detail($workRequest->fresh(['subtasks.assignee'])),
            ]);
        }

        return back()->with('success', 'Sub-task deleted.');
    }
}
