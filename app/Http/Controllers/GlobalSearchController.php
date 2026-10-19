<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\WorkRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        if ($q === '') {
            return response()->json([
                'requests' => [],
                'projects' => [],
            ]);
        }

        $numericId = null;
        if (is_numeric($q)) {
            $numericId = (int) $q;
        } elseif (preg_match('/^(?:#|#?REQ[-\s]?)(\d+)$/i', $q, $matches)) {
            $numericId = (int) $matches[1];
        }

        $user = $request->user();
        $activeWorkspace = $user?->currentWorkspace();

        $requests = WorkRequest::query()
            ->when($activeWorkspace, fn ($query) => $query->where('workspace_id', $activeWorkspace->id))
            ->when(! $activeWorkspace, fn ($query) => $query->where(fn ($sub) => $sub->where('requester_id', $user?->id)->orWhere('assignee_id', $user?->id)->orWhereNull('workspace_id')))
            ->with(['area', 'assignee'])
            ->where(function ($query) use ($q, $numericId): void {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhereHas('assignee', fn ($sub) => $sub->where('name', 'like', "%{$q}%")->orWhere('username', 'like', "%{$q}%"))
                    ->orWhereHas('area', fn ($sub) => $sub->where('name', 'like', "%{$q}%"));

                if ($numericId !== null) {
                    $query->orWhere('id', $numericId);
                }
            })
            ->limit(10)
            ->get()
            ->map(fn (WorkRequest $item): array => [
                'id' => $item->id,
                'title' => $item->title,
                'status' => $item->status?->value ?? (string) $item->status,
                'priority' => $item->priority?->value ?? (string) $item->priority,
                'project' => $item->area ? [
                    'id' => $item->area->id,
                    'name' => $item->area->name,
                    'color' => $item->area->color,
                ] : null,
            ]);

        $projects = Area::query()
            ->when($activeWorkspace, fn ($query) => $query->where('workspace_id', $activeWorkspace->id))
            ->when(! $activeWorkspace, fn ($query) => $query->whereNull('workspace_id'))
            ->whereNull('archived_at')
            ->where('name', 'like', "%{$q}%")
            ->limit(6)
            ->get(['id', 'name', 'color']);

        return response()->json([
            'requests' => $requests,
            'projects' => $projects,
        ]);
    }
}
