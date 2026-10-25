<?php

namespace App\Http\Controllers;

use App\Mail\WorkspaceInvitationMail;
use App\Models\Role;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

final class TeamMemberController extends Controller
{
    public function invite(Request $request): JsonResponse
    {
        $this->ensureCanManage($request);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role_id' => ['required', 'integer', Rule::exists('roles', 'id')],
        ]);

        $activeWorkspace = $request->user()->currentWorkspace();
        if (! $activeWorkspace) {
            $activeWorkspace = $request->user()->workspaces()->first();
        }

        if (! $activeWorkspace) {
            $activeWorkspace = Workspace::query()->firstOrCreate(
                ['slug' => 'default'],
                ['name' => 'Default Workspace', 'owner_id' => $request->user()->id]
            );
            $request->user()->workspaces()->syncWithoutDetaching([
                $activeWorkspace->id => ['role_id' => $request->user()->role_id ?? 1],
            ]);
        }

        if ($activeWorkspace->users()->where('email', $validated['email'])->exists()) {
            return response()->json(['message' => 'This user is already a member of this workspace.'], 422);
        }

        WorkspaceInvitation::query()
            ->where('workspace_id', $activeWorkspace->id)
            ->where('email', $validated['email'])
            ->delete();

        $invitation = WorkspaceInvitation::query()->create([
            'workspace_id' => $activeWorkspace->id,
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
            'token' => Str::random(40),
            'expires_at' => now()->addDays(7),
            'created_at' => now(),
        ]);

        Mail::to($invitation->email)->send(new WorkspaceInvitationMail($invitation));

        app(AuditService::class)->log(
            $request->user(),
            'member.invited',
            $invitation,
            [],
            ['email' => $invitation->email, 'role_id' => $invitation->role_id, 'workspace_id' => $activeWorkspace->id]
        );

        return response()->json([
            'invitation' => $invitation->load(['role:id,name', 'workspace:id,name']),
        ], 201);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureCanManage($request);

        if ($request->has('email') && ($request->boolean('invite') || ! $request->filled('password'))) {
            return $this->invite($request);
        }

        $validated = $request->validate($this->rules());
        $validated['active'] = (bool) ($validated['active'] ?? true);

        $user = User::query()->create($validated);

        $activeWorkspace = $request->user()->currentWorkspace();
        if ($activeWorkspace) {
            $activeWorkspace->users()->syncWithoutDetaching([
                $user->id => ['role_id' => $user->role_id],
            ]);
        }

        app(AuditService::class)->log(
            $request->user(),
            'member.invited',
            $user,
            [],
            ['name' => $user->name, 'username' => $user->username, 'role_id' => $user->role_id]
        );

        return response()->json(['user' => $user->load('role:id,name')]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->ensureCanManage($request);

        $activeWorkspace = $request->user()->currentWorkspace();
        if ($activeWorkspace) {
            abort_unless(
                $activeWorkspace->users()->where('users.id', $user->id)->exists(),
                404,
                'User is not a member of this workspace.'
            );
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => ['sometimes', 'required', 'integer', Rule::exists('roles', 'id')],
            'active' => ['sometimes', 'boolean'],
        ]);

        // Security: Passwords cannot be modified via team member management endpoint
        unset($validated['password']);

        // Self role-change prevention
        if ($user->id === $request->user()->id && isset($validated['role_id']) && (int) $validated['role_id'] !== (int) $user->role_id) {
            return response()->json(['message' => 'You cannot change your own role.'], 422);
        }

        // Protect last remaining Owner in workspace
        $ownerRoleId = (int) Role::query()->where('name', 'Owner')->value('id');
        if (isset($validated['role_id']) && (int) $validated['role_id'] !== $ownerRoleId && (int) $user->role_id === $ownerRoleId && $activeWorkspace) {
            $ownerCount = $activeWorkspace->users()->wherePivot('role_id', $ownerRoleId)->count();
            if ($ownerCount <= 1) {
                return response()->json(['message' => 'Cannot demote the last remaining Owner of the workspace.'], 422);
            }
        }

        $oldRoleId = $user->role_id;
        $oldValues = $user->only(['name', 'username', 'email', 'role_id', 'active']);

        $user->update($validated);

        if ($activeWorkspace && isset($validated['role_id'])) {
            $activeWorkspace->users()->updateExistingPivot($user->id, ['role_id' => $validated['role_id']]);
        }

        $event = ($user->role_id !== $oldRoleId) ? 'member.role_updated' : 'member.updated';
        app(AuditService::class)->log(
            $request->user(),
            $event,
            $user,
            $oldValues,
            $user->only(['name', 'username', 'email', 'role_id', 'active']),
            $activeWorkspace?->id
        );

        return response()->json(['user' => $user->fresh()->load('role:id,name')]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->ensureCanManage($request);

        abort_if($user->id === $request->user()->id, 422, 'You cannot remove your own account.');

        $activeWorkspace = $request->user()->currentWorkspace() ?? $request->user()->workspaces()->first();
        if (! $activeWorkspace) {
            abort(404, 'No active workspace found.');
        }

        abort_unless(
            $activeWorkspace->users()->where('users.id', $user->id)->exists(),
            404,
            'User is not a member of this workspace.'
        );

        // Protect last remaining Owner
        $ownerRoleId = (int) Role::query()->where('name', 'Owner')->value('id');
        $userPivotRole = (int) ($activeWorkspace->users()->where('users.id', $user->id)->first()?->pivot?->role_id ?? $user->role_id);
        if (($userPivotRole === $ownerRoleId || (int) $activeWorkspace->owner_id === $user->id)) {
            $ownerCount = $activeWorkspace->users()->wherePivot('role_id', $ownerRoleId)->count();
            if ($ownerCount <= 1) {
                return response()->json(['message' => 'Cannot remove the last remaining Owner of the workspace.'], 422);
            }
        }

        // Secure detachment from workspace; NEVER delete global user account
        $activeWorkspace->users()->detach($user->id);

        $oldValues = $user->only(['id', 'name', 'username', 'email']);

        app(AuditService::class)->log(
            $request->user(),
            'member.removed',
            $user,
            $oldValues,
            ['workspace_id' => $activeWorkspace?->id],
            $activeWorkspace?->id
        );

        return response()->json(['deleted' => true, 'detached' => true]);
    }

    /** @return array<string, mixed> */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'role_id' => ['required', 'integer', Rule::exists('roles', 'id')],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    private function ensureCanManage(Request $request): void
    {
        abort_unless($request->user()?->hasPermission('manage_team'), 403);
    }
}
