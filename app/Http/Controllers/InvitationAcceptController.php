<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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

        if ($user) {
            // Existing user: NEVER overwrite password, active status, or 2FA credentials
            if (Auth::check() && Auth::id() === $user->id) {
                // User is already logged in as this user
            } else {
                $validated = $request->validate([
                    'password' => ['required', 'string'],
                ]);

                if (! Hash::check($validated['password'], $user->password)) {
                    return back()->withErrors([
                        'password' => 'The provided password does not match your existing account password.',
                    ]);
                }
            }

            DB::transaction(function () use ($invitation, $user): void {
                $invitation->workspace->users()->syncWithoutDetaching([
                    $user->id => ['role_id' => $invitation->role_id],
                ]);

                $invitation->delete();
            });

            session(['active_workspace_id' => $invitation->workspace_id]);

            if (! Auth::check()) {
                Auth::login($user);
            }

            return redirect()->route('dashboard');
        }

        // New user registration
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($validated, $invitation): User {
            $user = User::query()->create([
                'name' => $validated['name'],
                'username' => $validated['username'],
                'email' => $invitation->email,
                'password' => Hash::make($validated['password']),
                'role_id' => $invitation->role_id,
                'active' => true,
                'force_password_reset' => false,
            ]);

            $invitation->workspace->users()->syncWithoutDetaching([
                $user->id => ['role_id' => $invitation->role_id],
            ]);

            $invitation->delete();

            return $user;
        });

        session(['active_workspace_id' => $invitation->workspace_id]);

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
