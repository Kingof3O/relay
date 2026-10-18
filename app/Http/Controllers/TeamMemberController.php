<?php

namespace App\Http\Controllers;

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use App\Mail\WorkspaceInvitationMail;
use App\Models\Workspace;
use App\Models\WorkspaceInvitation;
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
            'role_id' => ['required', 'integer', Rule::exists('roles', 'id')->where(fn (Builder $query) => $query->whereIn('name', [RoleName::Owner->value, RoleName::Developer->value, RoleName::Designer->value]))],
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

        app(\App\Services\AuditService::class)->log(
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

        app(\App\Services\AuditService::class)->log(
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
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role_id' => ['sometimes', 'required', 'integer', Rule::exists('roles', 'id')->where(fn (Builder $query) => $query->whereIn('name', [RoleName::Owner->value, RoleName::Developer->value, RoleName::Designer->value]))],
            'active' => ['sometimes', 'boolean'],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'max:255'],
        ]);

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $oldRoleId = $user->role_id;
        $oldValues = $user->only(['name', 'username', 'email', 'role_id', 'active']);

        $user->update($validated);

        $event = ($user->role_id !== $oldRoleId) ? 'member.role_updated' : 'member.updated';
        app(\App\Services\AuditService::class)->log(
            $request->user(),
            $event,
            $user,
            $oldValues,
            $user->only(['name', 'username', 'email', 'role_id', 'active'])
        );

        return response()->json(['user' => $user->fresh()->load('role:id,name')]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->ensureCanManage($request);

        abort_if($user->id === $request->user()->id, 422, 'You cannot remove your own account.');

        if ($user->requestedWork()->exists()) {
            return response()->json(['message' => 'This account requested work and cannot be removed. Deactivate it instead.'], 422);
        }

        $oldValues = $user->only(['id', 'name', 'username', 'email']);
        $user->delete();

        app(\App\Services\AuditService::class)->log(
            $request->user(),
            'member.removed',
            $user,
            $oldValues,
            []
        );

        return response()->json(['deleted' => true]);
    }

    /** @return array<string, mixed> */
    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'role_id' => ['required', 'integer', Rule::exists('roles', 'id')->where(fn (Builder $query) => $query->whereIn('name', [RoleName::Owner->value, RoleName::Developer->value, RoleName::Designer->value]))],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    private function ensureCanManage(Request $request): void
    {
        abort_unless($request->user()?->hasPermission('manage_team'), 403);
    }
}
