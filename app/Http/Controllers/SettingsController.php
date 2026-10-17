<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Index', [
            'projects' => Area::query()
                ->withCount(['requests' => fn ($q) => $q->where('status', '!=', 'done')])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn ($area): array => [
                    'id' => $area->id,
                    'name' => $area->name,
                    'slug' => $area->slug,
                    'color' => $area->color ?? '#8B5CF6',
                    'sort_order' => $area->sort_order,
                    'active_count' => $area->requests_count,
                    'archived_at' => $area->archived_at?->toIso8601String(),
                ]),
            'users' => $user->hasPermission('manage_team')
                ? User::query()->with('role:id,name')->orderBy('name')->get(['id', 'name', 'username', 'email', 'role_id', 'active', 'created_at'])
                : [],
            'roles' => $user->hasPermission('manage_team')
                ? Role::query()->whereIn('name', ['Owner', 'Developer', 'Designer'])->orderBy('name')->get(['id', 'name'])
                : [],
            'canManageAreas' => $user->hasPermission('manage_areas'),
            'canManageTeam' => $user->hasPermission('manage_team'),
            'audits' => \App\Models\WorkspaceAudit::query()
                ->with('user:id,name,username')
                ->latest('created_at')
                ->limit(15)
                ->get()
                ->map(fn ($audit): array => [
                    'id' => $audit->id,
                    'user' => $audit->user ? [
                        'id' => $audit->user->id,
                        'name' => $audit->user->name,
                        'username' => $audit->user->username,
                    ] : null,
                    'event' => $audit->event,
                    'auditable_type' => $audit->auditable_type ? class_basename($audit->auditable_type) : null,
                    'auditable_id' => $audit->auditable_id,
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                    'ip_address' => $audit->ip_address,
                    'created_at' => $audit->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
