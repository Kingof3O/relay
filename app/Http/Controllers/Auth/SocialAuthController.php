<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\Response;

final class SocialAuthController extends Controller
{
    private const SUPPORTED_PROVIDERS = ['github', 'google'];

    public function redirect(string $provider): Response
    {
        $this->ensureSupportedProvider($provider);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $this->ensureSupportedProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Throwable $e) {
            return redirect()->route('login')->withErrors([
                'username' => 'Unable to authenticate with social provider: '.$e->getMessage(),
            ]);
        }

        $idColumn = $provider === 'github' ? 'github_id' : 'google_id';
        $socialId = (string) $socialUser->getId();
        $email = $socialUser->getEmail();

        // 1. Try finding by provider ID
        $user = User::query()->where($idColumn, $socialId)->first();

        // 2. Try finding by email
        if (! $user && ! empty($email)) {
            $user = User::query()->where('email', $email)->first();
            if ($user) {
                $user->forceFill([$idColumn => $socialId])->save();
            }
        }

        // 3. Create new user if not found
        if (! $user) {
            $role = Role::query()->where('name', 'Developer')->first() ?? Role::query()->first();

            $rawUsername = $socialUser->getNickname() ?: $socialUser->getName() ?: 'user';
            $baseUsername = Str::slug($rawUsername, '_') ?: 'user';
            $username = $baseUsername;
            $counter = 1;

            while (User::query()->where('username', $username)->exists()) {
                $username = "{$baseUsername}_{$counter}";
                $counter++;
            }

            $user = User::query()->create([
                'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: 'Relay User',
                'username' => $username,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'role_id' => $role?->id,
                'active' => true,
                $idColumn => $socialId,
            ]);
        }

        if (! $user->active || $user->role_id === null) {
            return redirect()->route('login')->withErrors([
                'username' => 'Your account is deactivated or missing an assigned role.',
            ]);
        }

        Auth::login($user);
        request()->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    private function ensureSupportedProvider(string $provider): void
    {
        if (! in_array($provider, self::SUPPORTED_PROVIDERS, true)) {
            abort(404, 'Provider not supported.');
        }
    }
}
