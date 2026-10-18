<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\RoleName;
use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkspaceAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SettingsController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();

        $auditEvent = $request->input('audit_event');
        $auditPage = max((int) $request->input('audit_page', 1), 1);
        $auditPerPage = min(max((int) $request->input('audit_per_page', 15), 1), 100);

        $auditQuery = WorkspaceAudit::query()
            ->with('user:id,name,username')
            ->when($auditEvent, fn ($q) => $q->where('event', $auditEvent))
            ->latest('created_at');

        $totalAudits = (clone $auditQuery)->count();
        $audits = $auditQuery
            ->forPage($auditPage, $auditPerPage)
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
            ]);

        $auditEvents = WorkspaceAudit::query()->distinct()->pluck('event')->filter()->values();

        $auditMeta = [
            'current_page' => $auditPage,
            'per_page' => $auditPerPage,
            'total' => $totalAudits,
            'last_page' => max((int) ceil($totalAudits / $auditPerPage), 1),
            'event_filter' => $auditEvent,
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'audits' => $audits,
                'auditMeta' => $auditMeta,
                'auditEvents' => $auditEvents,
            ]);
        }

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
                ? Role::query()->whereIn('name', [RoleName::Owner->value, RoleName::Developer->value, RoleName::Designer->value])->orderBy('name')->get(['id', 'name'])
                : [],
            'canManageAreas' => $user->hasPermission('manage_areas'),
            'canManageTeam' => $user->hasPermission('manage_team'),
            'audits' => $audits,
            'auditMeta' => $auditMeta,
            'auditEvents' => $auditEvents,
        ]);
    }
}
