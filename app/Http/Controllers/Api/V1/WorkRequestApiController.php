<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\WorkRequestResource;
use App\Models\WorkRequest;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

final class WorkRequestApiController extends Controller
{
    public function __construct(
        private readonly WorkRequestService $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', WorkRequest::class);

        $user = $request->user();
        $activeWorkspace = $user?->currentWorkspace();

        $query = WorkRequest::query()
            ->when($activeWorkspace, fn ($q) => $q->where(fn ($sub) => $sub->where('workspace_id', $activeWorkspace->id)->orWhereNull('workspace_id')))
            ->when($request->filled('status'), fn ($q) => $q->where('status', (string) $request->input('status')))
            ->when($request->filled('priority'), fn ($q) => $q->where('priority', (string) $request->input('priority')))
            ->when($request->filled('area_id'), fn ($q) => $q->where('area_id', (int) $request->input('area_id')))
            ->with(['area', 'requester', 'assignee', 'subtasks'])
            ->orderByDesc('id');

        $perPage = min((int) ($request->input('per_page', 25) ?: 25), 100);
        $paginated = $query->paginate($perPage);

        return WorkRequestResource::collection($paginated);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', WorkRequest::class);

        $user = $request->user();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'area_id' => ['required', 'integer', 'exists:areas,id'],
            'priority' => ['nullable', 'string', Rule::enum(RequestPriority::class)],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', Rule::enum(RequestStatus::class)],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'story_points' => ['nullable', 'integer', 'min:0'],
            'parent_id' => ['nullable', 'integer', 'exists:requests,id'],
            'cycle_id' => ['nullable', 'integer', 'exists:cycles,id'],
            'is_blocked' => ['nullable', 'boolean'],
            'blocked_reason' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
        ]);

        $workRequest = $this->service->create($user, $validated);

        return (new WorkRequestResource($workRequest->fresh(['area', 'requester', 'assignee', 'subtasks'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, int $id): WorkRequestResource
    {
        $workRequest = WorkRequest::query()
            ->with(['area', 'requester', 'assignee', 'subtasks.assignee', 'pullRequests', 'relations.related'])
            ->findOrFail($id);

        $this->authorize('view', $workRequest);

        return new WorkRequestResource($workRequest);
    }

    public function update(Request $request, int $id): WorkRequestResource
    {
        $workRequest = WorkRequest::findOrFail($id);

        $this->authorize('update', $workRequest);

        $user = $request->user();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'area_id' => ['sometimes', 'integer', 'exists:areas,id'],
            'priority' => ['sometimes', 'string', Rule::enum(RequestPriority::class)],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'string', Rule::enum(RequestStatus::class)],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
            'story_points' => ['nullable', 'integer', 'min:0'],
            'parent_id' => ['nullable', 'integer', 'exists:requests,id'],
            'cycle_id' => ['nullable', 'integer', 'exists:cycles,id'],
            'is_blocked' => ['nullable', 'boolean'],
            'blocked_reason' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'tags' => ['nullable', 'array'],
        ]);

        $updated = $this->service->update($workRequest, $user, $validated);

        return new WorkRequestResource($updated->fresh(['area', 'requester', 'assignee', 'subtasks', 'pullRequests']));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $workRequest = WorkRequest::findOrFail($id);

        $this->authorize('delete', $workRequest);

        $workRequest->delete();

        return response()->json([
            'message' => 'Work request deleted successfully.',
            'deleted' => true,
        ]);
    }
}
