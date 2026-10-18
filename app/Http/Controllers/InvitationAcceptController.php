<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class InvitationAcceptController extends Controller
{
    public function show(Request $request, string $token): Response
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired invitation signature.');
        }

        $invitation = WorkspaceInvitation::query()->where('token', $token)->firstOrFail();

        if ($invitation->isExpired()) {
            abort(410, 'This invitation has expired.');
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'workspace' => $invitation->workspace?->only(['id', 'name', 'slug']),
                'role' => $invitation->role?->only(['id', 'name']),
                'expires_at' => $invitation->expires_at?->toIso8601String(),
            ],
        ]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        $invitation = WorkspaceInvitation::query()->where('token', $token)->firstOrFail();

        if ($invitation->isExpired()) {
            abort(410, 'This invitation has expired.');
        }

        /** @var User|null $user */
        $user = User::query()->where('email', $invitation->email)->first();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', \Illuminate\Validation\Rule::unique('users', 'username')->ignore($user?->id)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($user) {
            $user->update([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
                'active' => true,
                'force_password_reset' => false,
            ]);
        } else {
            $user = User::query()->create([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'email' => $invitation->email,
                'password' => Hash::make($validated['password']),
                'role_id' => $invitation->role_id,
                'active' => true,
                'force_password_reset' => false,
            ]);
        }

        $invitation->workspace->users()->syncWithoutDetaching([
            $user->id => ['role_id' => $invitation->role_id],
        ]);

        session(['active_workspace_id' => $invitation->workspace_id]);

        $invitation->delete();

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
