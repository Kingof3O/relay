<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WorkspaceController extends Controller
{
    public function switch(Request $request, Workspace $workspace): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $user->workspaces()->where('workspaces.id', $workspace->id)->exists()
            || $workspace->owner_id === $user->id,
            403,
            'You do not have access to this workspace.'
        );

        if (! $user->workspaces()->where('workspaces.id', $workspace->id)->exists() && $workspace->owner_id === $user->id) {
            $ownerRole = Role::query()->where('name', RoleName::Owner->value)->first()
                ?? Role::query()->where('name', 'Owner')->first();
            if ($ownerRole) {
                $workspace->users()->attach($user->id, ['role_id' => $ownerRole->id]);
            }
        }

        session(['active_workspace_id' => $workspace->id]);

        $previousUrl = url()->previous();
        if (preg_match('#/requests/\d+#', $previousUrl)) {
            return redirect()->route('requests.index');
        }

        if (str_contains($previousUrl, 'project=')) {
            return redirect()->route('requests.index');
        }

        return back();
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:1024'],
        ]);

        $baseSlug = Str::slug($validated['name']);
        if (blank($baseSlug)) {
            $baseSlug = 'workspace';
        }

        $slug = $baseSlug;
        $counter = 1;
        while (Workspace::query()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $user = $request->user();

        $workspace = Workspace::query()->create([
            'name' => $validated['name'],
            'slug' => $slug,
            'owner_id' => $user->id,
            'logo_url' => $validated['logo_url'] ?? null,
        ]);

        $ownerRole = Role::query()->where('name', RoleName::Owner->value)->first()
            ?? Role::query()->where('name', 'Owner')->first();

        if ($ownerRole) {
            $workspace->users()->attach($user->id, [
                'role_id' => $ownerRole->id,
            ]);
        }

        session(['active_workspace_id' => $workspace->id]);

        return back();
    }
}
