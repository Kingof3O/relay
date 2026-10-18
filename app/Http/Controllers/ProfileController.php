<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $assignedCount = $user ? $user->assignedWork()->count() : 0;
        $completedCount = $user ? $user->assignedWork()->where('status', 'done')->count() : 0;

        return Inertia::render('Profile/Edit', [
            'stats' => [
                'assigned_count' => $assignedCount,
                'completed_count' => $completedCount,
            ],
            'twoFactorEnabled' => $user?->hasTwoFactorEnabled() ?? false,
            'tokens' => $user ? $user->tokens()->latest('created_at')->get(['id', 'name', 'abilities', 'last_used_at', 'expires_at', 'created_at']) : [],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        $request->user()->save();

        return Redirect::route('profile.edit');
    }
}
