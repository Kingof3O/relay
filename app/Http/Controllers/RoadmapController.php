<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\WorkRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class RoadmapController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $activeWorkspace = $request->user()?->currentWorkspace();

        $year = (int) $request->input('year', now()->year);
        $quarter = (int) $request->input('quarter', (int) ceil(now()->month / 3));
        $quarter = max(1, min(4, $quarter));

        $quarterStart = Carbon::create($year, ($quarter - 1) * 3 + 1, 1)->startOfDay();
        $quarterEnd = $quarterStart->copy()->endOfQuarter()->endOfDay();

        // Projects / Initiatives
        $projects = Area::query()
            ->whereNull('archived_at')
            ->when($activeWorkspace, fn ($q) => $q->where(fn ($sub) => $sub->where('workspace_id', $activeWorkspace->id)->orWhereNull('workspace_id')))
            ->orderBy('sort_order')
            ->with(['requests' => fn ($q) => $q->whereNull('parent_id')])
            ->get()
            ->map(function (Area $area): array {
                $reqs = $area->requests;
                $total = $reqs->count();
                $completed = $reqs->filter(fn ($r) => ($r->status?->value ?? (string) $r->getRawOriginal('status')) === 'done')->count();

                $dueDates = $reqs->pluck('due_date')->filter()->map(fn ($d) => Carbon::parse($d));
                $createdDates = $reqs->pluck('created_at')->filter()->map(fn ($d) => Carbon::parse($d));

                $earliestDate = $createdDates->min()?->format('Y-m-d') ?? now()->toDateString();
                $latestDueDate = $dueDates->max()?->format('Y-m-d') ?? now()->addMonth()->toDateString();

                return [
                    'id' => $area->id,
                    'name' => $area->name,
                    'slug' => $area->slug,
                    'color' => $area->color ?? '#8B5CF6',
                    'total_requests' => $total,
                    'completed_requests' => $completed,
                    'completion_percentage' => $total > 0 ? (int) round(($completed / $total) * 100) : 0,
                    'start_date' => $earliestDate,
                    'due_date' => $latestDueDate,
                ];
            })
            ->values()
            ->all();

        // Work requests with relations for timeline Gantt
        $requests = WorkRequest::query()
            ->whereNull('parent_id')
            ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
            ->where(function ($query) use ($quarterStart, $quarterEnd): void {
                $query->whereBetween('created_at', [$quarterStart, $quarterEnd])
                    ->orWhereBetween('due_date', [$quarterStart, $quarterEnd])
                    ->orWhere(fn ($sub) => $sub->where('created_at', '<=', $quarterStart)->where('due_date', '>=', $quarterEnd))
                    ->orWhere(fn ($sub) => $sub->whereNull('due_date')->where('created_at', '<=', $quarterEnd));
            })
            ->with(['area', 'assignee', 'relations.related'])
            ->orderBy('due_date')
            ->orderBy('id')
            ->get()
            ->map(function (WorkRequest $r): array {
                $statusVal = $r->status?->value ?? (string) $r->getRawOriginal('status');
                $priorityVal = $r->priority?->value ?? (string) $r->getRawOriginal('priority');

                $blockingIds = $r->relations
                    ->where('type', 'blocks')
                    ->pluck('related_id')
                    ->values()
                    ->all();

                $startDate = $r->created_at ? $r->created_at->format('Y-m-d') : now()->toDateString();
                $dueDate = $r->due_date ? $r->due_date->format('Y-m-d') : ($r->created_at ? $r->created_at->addDays(7)->format('Y-m-d') : now()->addDays(7)->format('Y-m-d'));

                return [
                    'id' => $r->id,
                    'title' => $r->title,
                    'status' => $statusVal,
                    'status_label' => $r->status?->label() ?? ucfirst($statusVal),
                    'priority' => $priorityVal,
                    'priority_label' => $r->priority?->label() ?? ucfirst($priorityVal),
                    'story_points' => $r->story_points !== null ? (int) $r->story_points : null,
                    'is_blocked' => (bool) $r->is_blocked,
                    'blocked_reason' => $r->blocked_reason,
                    'start_date' => $startDate,
                    'due_date' => $dueDate,
                    'project' => $r->area ? [
                        'id' => $r->area->id,
                        'name' => $r->area->name,
                        'color' => $r->area->color ?? '#8B5CF6',
                    ] : null,
                    'assignee' => $r->assignee ? [
                        'id' => $r->assignee->id,
                        'name' => $r->assignee->name,
                        'username' => $r->assignee->username,
                    ] : null,
                    'blocking_ids' => $blockingIds,
                ];
            })
            ->values()
            ->all();

        $payload = [
            'projects' => $projects,
            'requests' => $requests,
            'year' => $year,
            'quarter' => $quarter,
            'quarter_start' => $quarterStart->format('Y-m-d'),
            'quarter_end' => $quarterEnd->format('Y-m-d'),
        ];

        if ($request->expectsJson()) {
            return response()->json($payload);
        }

        return Inertia::render('Roadmap/Index', $payload);
    }
}
