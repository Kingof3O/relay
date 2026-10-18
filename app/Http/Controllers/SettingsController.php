<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\RoleName;
use App\Models\Area;
use App\Models\Role;
use App\Models\User;
use App\Models\WorkspaceAudit;
use App\Services\AuditService;
use App\Services\DiscordNotificationService;
use App\Services\EmailNotificationService;
use App\Services\SocialAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SettingsController extends Controller
{
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();

        $activeWorkspace = $user->currentWorkspace();

        $auditEvent = $request->input('audit_event');
        $auditPage = max((int) $request->input('audit_page', 1), 1);
        $auditPerPage = min(max((int) $request->input('audit_per_page', 15), 1), 100);

        $auditQuery = WorkspaceAudit::query()
            ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
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
                ->when($activeWorkspace, fn ($q) => $q->where('workspace_id', $activeWorkspace->id))
                ->withCount(['requests' => fn ($q) => $q->when($activeWorkspace, fn ($sq) => $sq->where('workspace_id', $activeWorkspace->id))->where('status', '!=', 'done')])
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
                ? ($activeWorkspace && $activeWorkspace->users()->exists()
                    ? $activeWorkspace->users()->with('role:id,name')->orderBy('name')->get(['users.id', 'users.name', 'users.username', 'users.email', 'users.role_id', 'users.active', 'users.created_at'])
                    : User::query()->with('role:id,name')->orderBy('name')->get(['id', 'name', 'username', 'email', 'role_id', 'active', 'created_at']))
                : [],
            'roles' => $user->hasPermission('manage_team')
                ? Role::query()->whereIn('name', [RoleName::Owner->value, RoleName::Developer->value, RoleName::Designer->value])->orderBy('name')->get(['id', 'name'])
                : [],
            'canManageAreas' => $user->hasPermission('manage_areas'),
            'canManageTeam' => $user->hasPermission('manage_team'),
            'oauthProviders' => SocialAuthService::providersStatus(),
            'discord' => DiscordNotificationService::getStatus(),
            'email' => EmailNotificationService::getStatus(),
            'audits' => $audits,
            'auditMeta' => $auditMeta,
            'auditEvents' => $auditEvents,
        ]);
    }

    public function toggleOAuthProvider(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasPermission('manage_workspace')) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'provider' => ['required', 'string', 'in:github,google'],
            'enabled' => ['required', 'boolean'],
        ]);

        $provider = $validated['provider'];
        $enabled = (bool) $validated['enabled'];

        SocialAuthService::setEnabled($provider, $enabled);

        app(AuditService::class)->log(
            $user,
            'oauth_provider.'.($enabled ? 'enabled' : 'disabled'),
            null,
            ['provider' => $provider],
            ['provider' => $provider, 'enabled' => $enabled]
        );

        return response()->json([
            'message' => ucfirst($provider).' authentication '.($enabled ? 'enabled' : 'disabled').'.',
            'oauthProviders' => SocialAuthService::providersStatus(),
        ]);
    }
}
