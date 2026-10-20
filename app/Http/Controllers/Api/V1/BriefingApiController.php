<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkRequestResource;
use App\Models\Cycle;
use App\Models\WorkRequest;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BriefingApiController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $workspace = $user?->currentWorkspace() ?? $user?->workspaces()->first();

        if (! $workspace) {
            return response()->json([
                'message' => 'User does not belong to an active workspace.',
            ], 403);
        }

        $sinceHours = max(1, min((int) ($request->input('since_hours', 24) ?: 24), 168));
        $cutoff = CarbonImmutable::now()->subHours($sinceHours);

        // Base workspace query (never leaks other workspaces or soft-deleted records)
        $workspaceRequests = WorkRequest::query()
            ->where('workspace_id', $workspace->id)
            ->whereNull('deleted_at');

        // Metrics
        $totalOpen = (clone $workspaceRequests)
            ->whereNotIn('status', ['done', 'cancelled'])
            ->count();

        $inProgress = (clone $workspaceRequests)
            ->whereIn('status', ['doing', 'in_progress'])
            ->count();

        $inReview = (clone $workspaceRequests)
            ->where('status', 'review')
            ->count();

        $blockedCount = (clone $workspaceRequests)
            ->where('is_blocked', true)
            ->whereNotIn('status', ['done', 'cancelled'])
            ->count();

        $urgentCount = (clone $workspaceRequests)
            ->where('priority', 'urgent')
            ->whereNotIn('status', ['done', 'cancelled'])
            ->count();

        $myAssignedCount = (clone $workspaceRequests)
            ->where('assignee_id', $user->id)
            ->whereNotIn('status', ['done', 'cancelled'])
            ->count();

        $overdueCount = (clone $workspaceRequests)
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', CarbonImmutable::today())
            ->whereNotIn('status', ['done', 'cancelled'])
            ->count();

        $createdSinceCount = (clone $workspaceRequests)
            ->where('created_at', '>=', $cutoff)
            ->count();

        // 1. Urgent & Blocked tasks (Immediate attention required)
        $urgentAndBlocked = (clone $workspaceRequests)
            ->where(function ($q): void {
                $q->where('priority', 'urgent')
                    ->orWhere('is_blocked', true);
            })
            ->whereNotIn('status', ['done', 'cancelled'])
            ->with(['area', 'assignee', 'requester', 'subtasks'])
            ->orderByRaw("CASE WHEN priority = 'urgent' THEN 1 ELSE 2 END")
            ->orderByDesc('updated_at')
            ->limit(15)
            ->get();

        // 2. New requests created since cutoff
        $newRequests = (clone $workspaceRequests)
            ->where('created_at', '>=', $cutoff)
            ->with(['area', 'assignee', 'requester', 'subtasks'])
            ->orderByDesc('created_at')
            ->limit(15)
            ->get();

        // 3. Tasks assigned to current user in ready, doing or review
        $myTasks = (clone $workspaceRequests)
            ->where('assignee_id', $user->id)
            ->whereIn('status', ['ready', 'doing', 'in_progress', 'review'])
            ->with(['area', 'requester', 'subtasks'])
            ->orderByRaw("CASE WHEN status IN ('doing', 'in_progress') THEN 1 WHEN status = 'ready' THEN 2 ELSE 3 END")
            ->orderByDesc('priority')
            ->limit(15)
            ->get();

        // 4. Current active cycle/sprint
        $activeCycle = Cycle::query()
            ->where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->first();

        $cycleData = null;
        if ($activeCycle) {
            $cycleRequests = WorkRequest::query()
                ->where('cycle_id', $activeCycle->id)
                ->whereNull('deleted_at');

            $totalPoints = (int) (clone $cycleRequests)->sum('story_points');
            $completedPoints = (int) (clone $cycleRequests)->where('status', 'done')->sum('story_points');
            $totalCount = (clone $cycleRequests)->count();
            $completedCount = (clone $cycleRequests)->where('status', 'done')->count();

            $daysRemaining = $activeCycle->end_date
                ? max(0, (int) CarbonImmutable::today()->diffInDays($activeCycle->end_date, false))
                : null;

            $cycleData = [
                'id' => $activeCycle->id,
                'name' => $activeCycle->name,
                'number' => $activeCycle->number,
                'start_date' => $activeCycle->start_date?->format('Y-m-d'),
                'end_date' => $activeCycle->end_date?->format('Y-m-d'),
                'days_remaining' => $daysRemaining,
                'total_points' => $totalPoints,
                'completed_points' => $completedPoints,
                'points_progress_percentage' => $totalPoints > 0 ? round(($completedPoints / $totalPoints) * 100, 1) : 0,
                'total_tasks' => $totalCount,
                'completed_tasks' => $completedCount,
            ];
        }

        // 5. Unread notifications count and recent mentions
        $unreadCount = $user->unreadNotifications()->count();
        $recentNotifications = $user->unreadNotifications()
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($n): array => [
                'id' => $n->id,
                'type' => class_basename($n->type),
                'data' => $n->data,
                'created_at' => $n->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
            ],
            'window' => [
                'since_hours' => $sinceHours,
                'cutoff' => $cutoff->toIso8601String(),
                'generated_at' => CarbonImmutable::now()->toIso8601String(),
            ],
            'metrics' => [
                'total_open' => $totalOpen,
                'in_progress' => $inProgress,
                'in_review' => $inReview,
                'urgent' => $urgentCount,
                'blocked' => $blockedCount,
                'overdue' => $overdueCount,
                'my_assigned' => $myAssignedCount,
                'created_since_window' => $createdSinceCount,
                'unread_notifications' => $unreadCount,
            ],
            'urgent_and_blocked' => WorkRequestResource::collection($urgentAndBlocked),
            'new_requests' => WorkRequestResource::collection($newRequests),
            'my_tasks' => WorkRequestResource::collection($myTasks),
            'active_cycle' => $cycleData,
            'recent_notifications' => $recentNotifications,
        ]);
    }
}
