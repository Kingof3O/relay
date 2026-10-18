<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user !== null) {
            $user->loadMissing('role.permissions');
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'role' => $user?->role,
                'permissions' => $user?->role?->permissions?->pluck('name')->values()->all() ?? [],
            ],
            'currentWorkspace' => fn (): ?\App\Models\Workspace => $user?->currentWorkspace(),
            'userWorkspaces' => fn (): array => $user === null
                ? []
                : $user->workspaces()
                    ->get(['workspaces.id', 'workspaces.name', 'workspaces.slug', 'workspaces.logo_url'])
                    ->all(),
            'flash' => fn (): array => [
                'alert' => $request->session()->get('alert'),
                'message' => $request->session()->get('message'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'ziggy' => fn (): array => [
                ...(new \Tighten\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'workspaceNotifications' => fn (): array => $user === null
                ? []
                : $user->notifications()
                    ->latest()
                    ->limit(15)
                    ->get()
                    ->map(fn ($notification): array => [
                        'id' => $notification->id,
                        'read_at' => $notification->read_at?->toIso8601String(),
                        ...((array) $notification->data),
                        'created_at' => $notification->created_at?->toIso8601String(),
                    ])
                    ->all(),
            'unreadNotificationsCount' => fn (): int => $user === null
                ? 0
                : $user->unreadNotifications()->count(),
            'workspaceProjects' => fn (): array => once(function () use ($user): array {
                $activeWorkspace = $user?->currentWorkspace();

                return \App\Models\Area::query()
                    ->whereNull('archived_at')
                    ->when($activeWorkspace, fn ($q) => $q->where(fn ($sub) => $sub->where('workspace_id', $activeWorkspace->id)->orWhereNull('workspace_id')))
                    ->orderBy('sort_order')
                    ->withCount(['requests' => fn ($q) => $q->where('status', '!=', 'done')])
                    ->get(['id', 'name', 'slug', 'color'])
                    ->map(fn ($area): array => [
                        'id' => $area->id,
                        'name' => $area->name,
                        'slug' => $area->slug,
                        'color' => $area->color ?? '#8B5CF6',
                        'active_count' => $area->requests_count,
                    ])
                    ->all();
            }),
            'savedViews' => fn (): array => $user === null
                ? []
                : \App\Models\SavedView::query()
                    ->where('user_id', $user->id)
                    ->orderByDesc('is_pinned')
                    ->orderBy('name')
                    ->get(['id', 'name', 'icon', 'filters', 'group_by', 'is_pinned'])
                    ->all(),
        ];
    }
}
