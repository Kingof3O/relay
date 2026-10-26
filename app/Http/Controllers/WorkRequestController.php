<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Http\Requests\WorkRequest\BulkWorkRequestRequest;
use App\Http\Requests\WorkRequest\UpdateWorkRequestRequest;
use App\Models\Area;
use App\Models\Cycle;
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
    ) {}

    public function index(Request $request): Response|JsonResponse
    {
        $this->authorize('viewAny', WorkRequest::class);

        $filterValues = $request->only(['project', 'area', 'owner', 'requester', 'status', 'priority', 'my_work', 'blocked', 'is_blocked', 'search']);
        $activeWorkspace = $request->user()?->currentWorkspace();

        $queryCap = 250;
        $maxCap = 500;
        $limit = $request->input('limit') ?? $request->input('per_page') ?? $request->input('window');
        $effectiveLimit = $limit !== null ? min(max((int) $limit, 1), $maxCap) : $queryCap;

        $requests = WorkRequest::query()
            ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
            ->filter($filterValues, $request->user())
            ->with(['area', 'requester', 'assignee', 'cycle', 'subtasks'])
            ->withCount('files')
            ->orderByDesc('is_blocked')
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END")
            ->orderByDesc('updated_at')
            ->limit($effectiveLimit)
            ->get()
            ->map(fn (WorkRequest $workRequest): array => $this->presenter->card($workRequest))
            ->values()
            ->all();

        $workspaceUsers = $activeWorkspace
            ? $activeWorkspace->users()->where('users.active', true)->whereNotNull('users.role_id')->with('role:id,name')->orderBy('users.name')->get(['users.id', 'users.name', 'users.username', 'users.role_id'])
            : collect();

        $workspaceProjects = Inertia::getShared('workspaceProjects')
            ?? ($activeWorkspace ? Area::query()->where('workspace_id', $activeWorkspace->id)->whereNull('archived_at')->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'color']) : collect());

        if ($request->wantsJson()) {
            return response()->json([
                'requests' => $requests,
                'count' => count($requests),
                'limit' => $effectiveLimit,
            ]);
        }

        return Inertia::render('Requests/Index', [
            'requests' => $requests,
            'limit' => $effectiveLimit,
            'projects' => $workspaceProjects,
            'users' => $workspaceUsers,
            'statuses' => RequestStatus::options(),
            'priorities' => RequestPriority::options(),
            'filters' => $request->only(['project', 'owner', 'requester', 'status', 'priority', 'search', 'my_work']),
            'canAssign' => $request->user()?->hasPermission('assign_requests') ?? false,
        ]);
    }

    public function show(WorkRequest $request): Response|JsonResponse
    {
        $this->authorize('view', $request);

        $request->load(['files.uploader', 'activities.user', 'area', 'requester', 'assignee', 'subtasks']);

        if (request()->wantsJson() && ! request()->header('X-Inertia')) {
            return response()->json([
                'request' => $this->presenter->detail($request),
            ]);
        }

        $activeWorkspace = request()->user()?->currentWorkspace();
        $workspaceUsers = $activeWorkspace
            ? $activeWorkspace->users()->where('users.active', true)->whereNotNull('users.role_id')->with('role:id,name')->orderBy('users.name')->get(['users.id', 'users.name', 'users.username', 'users.role_id'])
            : collect();

        $workspaceProjects = Inertia::getShared('workspaceProjects')
            ?? ($activeWorkspace ? Area::query()->where('workspace_id', $activeWorkspace->id)->whereNull('archived_at')->orderBy('sort_order')->orderBy('name')->get(['id', 'name', 'color']) : collect());

        return Inertia::render('Requests/Show', [
            'request' => $this->presenter->detail($request),
            'projects' => $workspaceProjects,
            'users' => $workspaceUsers,
            'cycles' => Cycle::query()
                ->when(request()->user()?->currentWorkspace(), fn ($q, $ws) => $q->where('workspace_id', $ws->id))
                ->orderByDesc('number')
                ->get(['id', 'number', 'name', 'is_active']),
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

        if ($formRequest->has('lock_version')) {
            $submittedLockVersion = (int) $formRequest->input('lock_version');
            $currentLockVersion = (int) ($request->lock_version ?? 1);

            if ($submittedLockVersion !== $currentLockVersion) {
                if ($formRequest->expectsJson()) {
                    return response()->json([
                        'message' => 'This request has been updated by another teammate.',
                        'error' => 'This request has been updated by another teammate.',
                        'current_lock_version' => $currentLockVersion,
                    ], 409);
                }

                return back()->with([
                    'error' => 'This request has been updated by another teammate.',
                    'conflict' => true,
                ])->setStatusCode(409);
            }
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
        $this->requests->delete($request, $this->files, $httpRequest->user()?->id);

        if ($httpRequest->expectsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect()->route('requests.index');
    }

    public function restore(Request $httpRequest, WorkRequest $request): JsonResponse|RedirectResponse
    {
        $this->authorize('delete', $request);
        $request->restore();

        if ($httpRequest->expectsJson()) {
            return response()->json([
                'restored' => true,
                'request' => $this->presenter->detail($request->fresh()),
            ]);
        }

        return redirect()->route('requests.show', $request);
    }
}
