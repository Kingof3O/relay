<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\SavedView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class SavedViewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $activeWorkspace = $user?->currentWorkspace();

        $views = SavedView::query()
            ->where('user_id', $user->id)
            ->when($activeWorkspace, fn ($q) => $q->where(fn ($sub) => $sub->where('workspace_id', $activeWorkspace->id)->orWhereNull('workspace_id')))
            ->orderByDesc('is_pinned')
            ->orderBy('name')
            ->get();

        return response()->json(['views' => $views]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:50'],
            'filters' => ['required', 'array'],
            'group_by' => ['sometimes', 'nullable', 'string', 'max:50'],
            'is_pinned' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $activeWorkspace = $user?->currentWorkspace();

        $savedView = SavedView::query()->create([
            'user_id' => $user->id,
            'workspace_id' => $activeWorkspace?->id,
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? 'filter',
            'filters' => $validated['filters'],
            'group_by' => $validated['group_by'] ?? null,
            'is_pinned' => $validated['is_pinned'] ?? true,
        ]);

        if ($request->expectsJson()) {
            return response()->json(['saved_view' => $savedView], 201);
        }

        return back()->with('success', 'View saved successfully.');
    }

    public function destroy(Request $request, SavedView $savedView): JsonResponse|RedirectResponse
    {
        if ($savedView->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $savedView->delete();

        if ($request->expectsJson()) {
            return response()->json(['deleted' => true]);
        }

        return back()->with('success', 'View removed.');
    }

    public function togglePin(Request $request, SavedView $savedView): JsonResponse|RedirectResponse
    {
        if ($savedView->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $savedView->update([
            'is_pinned' => ! $savedView->is_pinned,
        ]);

        if ($request->expectsJson()) {
            return response()->json(['saved_view' => $savedView]);
        }

        return back();
    }
}
