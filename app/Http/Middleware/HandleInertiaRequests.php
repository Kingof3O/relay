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
            'workspaceProjects' => fn (): array => \App\Models\Area::query()
                ->whereNull('archived_at')
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
                ->all(),
        ];
    }
}
