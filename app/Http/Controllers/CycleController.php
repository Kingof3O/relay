<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Cycle;
use App\Models\WorkRequest;
use App\Services\CycleService;
use App\Services\WorkRequestPresenter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class CycleController extends Controller
{
    public function __construct(
        private readonly CycleService $cycles,
        private readonly WorkRequestPresenter $presenter,
    ) {
    }

    public function index(Request $request): Response
    {
        $activeWorkspace = $request->user()?->currentWorkspace();

        $cyclesQuery = Cycle::query()
            ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
            ->orderByDesc('number');

        $allCycles = $cyclesQuery->get();

        // Target cycle
        $cycle = null;
        if ($request->filled('cycle_id')) {
            $cycle = $allCycles->firstWhere('id', (int) $request->cycle_id);
        }

        if (! $cycle) {
            $cycle = $allCycles->firstWhere('is_active', true) ?? $allCycles->first();
        }

        // If no cycles exist at all, auto-initialize Cycle 1
        if (! $cycle) {
            $startDate = now()->startOfDay();
            $cycle = Cycle::query()->create([
                'workspace_id' => $activeWorkspace?->id,
                'number' => 1,
                'name' => 'Cycle 1',
                'start_date' => $startDate->toDateString(),
                'end_date' => $startDate->copy()->addDays(13)->toDateString(),
                'is_active' => true,
            ]);
            $allCycles = collect([$cycle]);
        }

        $burndown = $this->cycles->getBurndown($cycle);

        $tickets = $cycle->requests()
            ->with(['area', 'requester', 'assignee'])
            ->orderByDesc('is_blocked')
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 WHEN 'low' THEN 4 ELSE 5 END")
            ->orderByDesc('id')
            ->get()
            ->map(fn (WorkRequest $ticket): array => $this->presenter->card($ticket))
            ->values()
            ->all();

        return Inertia::render('Cycles/Index', [
            'currentCycle' => [
                'id' => $cycle->id,
                'number' => $cycle->number,
                'name' => $cycle->name,
                'start_date' => $cycle->start_date?->format('Y-m-d'),
                'end_date' => $cycle->end_date?->format('Y-m-d'),
                'is_active' => (bool) $cycle->is_active,
                'completed_at' => $cycle->completed_at?->toIso8601String(),
            ],
            'cycles' => $allCycles->map(fn (Cycle $c): array => [
                'id' => $c->id,
                'number' => $c->number,
                'name' => $c->name,
                'start_date' => $c->start_date?->format('Y-m-d'),
                'end_date' => $c->end_date?->format('Y-m-d'),
                'is_active' => (bool) $c->is_active,
                'completed_at' => $c->completed_at?->toIso8601String(),
            ])->values()->all(),
            'burndown' => $burndown,
            'tickets' => $tickets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $activeWorkspace = $request->user()?->currentWorkspace();
        $latestNumber = (int) Cycle::query()
            ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
            ->max('number');

        if (!empty($validated['is_active'])) {
            Cycle::query()
                ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
                ->update(['is_active' => false]);
        }

        $cycle = Cycle::query()->create([
            'workspace_id' => $activeWorkspace?->id,
            'number' => $latestNumber + 1,
            'name' => $validated['name'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        return redirect()->route('cycles.index', ['cycle_id' => $cycle->id]);
    }

    public function rollover(Cycle $cycle): RedirectResponse
    {
        $nextCycle = $this->cycles->rollover($cycle);

        return redirect()->route('cycles.index', ['cycle_id' => $nextCycle->id]);
    }
}
