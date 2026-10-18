<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Http\Requests\WorkRequest\BulkWorkRequestRequest;
use App\Http\Requests\WorkRequest\UpdateWorkRequestRequest;
use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use App\Services\RequestFileService;
use App\Services\WorkRequestPresenter;
use App\Services\WorkRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class WorkRequestController extends Controller
{
    public function __construct(
        private readonly WorkRequestService $requests,
        private readonly WorkRequestPresenter $presenter,
        private readonly RequestFileService $files,
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', WorkRequest::class);

        $filterValues = $request->only(['project', 'area', 'owner', 'requester', 'status', 'priority', 'my_work', 'blocked', 'is_blocked', 'search']);
        $activeWorkspace = $request->user()?->currentWorkspace();

        $requests = WorkRequest::query()
            ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
            ->filter($filterValues, $request->user())
            ->with(['area', 'requester', 'assignee', 'cycle', 'subtasks'])
            ->orderByDesc('is_blocked')
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END")
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (WorkRequest $workRequest): array => $this->presenter->card($workRequest))
            ->values()
            ->all();

        return Inertia::render('Requests/Index', [
            'requests' => $requests,
            'projects' => Inertia::getShared('workspaceProjects') ?? Area::query()->whereNull('archived_at')->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'color']),
            'users' => User::query()->where('active', true)->whereNotNull('role_id')->with('role:id,name')->orderBy('name')->get(['id', 'name', 'username', 'role_id']),
            'statuses' => RequestStatus::options(),
            'priorities' => RequestPriority::options(),
            'filters' => $request->only(['project', 'owner', 'requester', 'status', 'priority', 'search', 'my_work']),
            'canAssign' => $request->user()?->hasPermission('assign_requests') ?? false,
        ]);
    }

    public function show(WorkRequest $request): Response
    {
        $this->authorize('view', $request);

        $request->load(['files.uploader', 'activities.user', 'area', 'requester', 'assignee']);

        return Inertia::render('Requests/Show', [
            'request' => $this->presenter->detail($request),
            'projects' => Inertia::getShared('workspaceProjects') ?? Area::query()->whereNull('archived_at')->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'color']),
            'users' => User::query()->where('active', true)->whereNotNull('role_id')->with('role:id,name')->orderBy('name')->get(['id', 'name', 'username', 'role_id']),
            'statuses' => RequestStatus::options(),
            'priorities' => RequestPriority::options(),
            'canAssign' => request()->user()?->can('assign', $request) ?? false,
            'canEdit' => request()->user()?->can('update', $request) ?? false,
            'canComment' => request()->user()?->can('comment', $request) ?? false,
            'canUpload' => request()->user()?->can('upload', $request) ?? false,
            'canDelete' => request()->user()?->can('delete', $request) ?? false,
        ]);
    }

    public function bulk(BulkWorkRequestRequest $formRequest): JsonResponse
    {
        $results = $this->requests->bulkCreate(
            $formRequest->user(),
            $formRequest->validated('requests'),
            fn (WorkRequest $created): array => $this->presenter->card($created),
        );

        return response()->json([
            'results' => $results,
            'created' => collect($results)->where('success', true)->count(),
            'failed' => collect($results)->where('success', false)->count(),
        ]);
    }

    public function update(UpdateWorkRequestRequest $formRequest, WorkRequest $request): JsonResponse|RedirectResponse
    {
        if ($formRequest->has('status')) {
            $this->authorize('changeStatus', $request);
        }

        $updated = $this->requests->update($request, $formRequest->user(), $formRequest->validated());

        if ($formRequest->expectsJson()) {
            return response()->json(['request' => $this->presenter->detail($updated->fresh())]);
        }

        return back();
    }

    public function destroy(Request $httpRequest, WorkRequest $request): JsonResponse|RedirectResponse
    {
        $this->authorize('delete', $request);
        $this->requests->delete($request, $this->files);

        if ($httpRequest->expectsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect()->route('requests.index');
    }
}
