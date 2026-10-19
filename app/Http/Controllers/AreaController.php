<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AreaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $this->ensureCanManage($request);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);
        $activeWorkspace = $request->user()?->currentWorkspace();
        $slug = str($validated['name'])->slug()->toString();

        if (Area::query()->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))->where('slug', $slug)->exists()) {
            return response()->json(['message' => 'A project with that name already exists in this workspace.'], 422);
        }

        $area = Area::query()->create([
            ...$validated,
            'workspace_id' => $activeWorkspace?->id,
            'slug' => $slug,
            'sort_order' => (int) Area::query()->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))->max('sort_order') + 1,
        ]);

        app(AuditService::class)->log(
            $request->user(),
            'project.created',
            $area,
            [],
            ['name' => $area->name, 'slug' => $area->slug, 'color' => $area->color]
        );

        return response()->json(['project' => $area]);
    }

    public function update(Request $request, Area $area): JsonResponse
    {
        $this->ensureCanManage($request);
        $activeWorkspace = $request->user()?->currentWorkspace();
        if ($area->workspace_id !== null && $activeWorkspace && $area->workspace_id !== $activeWorkspace->id) {
            abort(403, 'Unauthorized access to project.');
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:80'],
            'color' => ['sometimes', 'nullable', 'string', 'max:20'],
            'archived' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('name', $validated)) {
            $slug = str($validated['name'])->slug()->toString();

            if (Area::query()->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))->where('slug', $slug)->where('id', '!=', $area->id)->exists()) {
                return response()->json(['message' => 'A project with that name already exists in this workspace.'], 422);
            }

            $validated['slug'] = $slug;
        }

        if (array_key_exists('archived', $validated)) {
            $validated['archived_at'] = $validated['archived'] ? now() : null;
            unset($validated['archived']);
        }

        $area->update($validated);

        return response()->json(['project' => $area->fresh()]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $this->ensureCanManage($request);
        $validated = $request->validate([
            'order' => ['required', 'array'],
            'order.*' => ['integer', 'distinct', 'exists:areas,id'],
        ]);

        $activeWorkspace = $request->user()?->currentWorkspace();
        foreach ($validated['order'] as $index => $areaId) {
            Area::query()
                ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
                ->whereKey($areaId)
                ->update(['sort_order' => $index]);
        }

        return response()->json(['saved' => true]);
    }

    public function destroy(Request $request, Area $area): JsonResponse
    {
        $this->ensureCanManage($request);
        $activeWorkspace = $request->user()?->currentWorkspace();
        if ($area->workspace_id !== null && $activeWorkspace && $area->workspace_id !== $activeWorkspace->id) {
            abort(403, 'Unauthorized access to project.');
        }

        $oldValues = ['archived_at' => $area->archived_at?->toIso8601String()];
        $area->update(['archived_at' => now()]);

        app(AuditService::class)->log(
            $request->user(),
            'project.archived',
            $area,
            $oldValues,
            ['archived_at' => $area->archived_at?->toIso8601String()]
        );

        return response()->json(['archived' => true]);
    }

    private function ensureCanManage(Request $request): void
    {
        abort_unless($request->user()?->hasPermission('manage_areas'), 403);
    }
}
