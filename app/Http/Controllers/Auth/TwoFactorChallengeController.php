<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

final class TwoFactorChallengeController extends Controller
{
    public function __construct(private readonly TwoFactorService $twoFactor) {}

    /**
     * Show the two-factor authentication challenge view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Attempt to authenticate the user using a 2FA TOTP code or recovery code.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! $request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        $request->validate([
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        /** @var User|null $user */
        $user = User::query()->find($request->session()->get('login.id'));

        if (! $user || ! $user->hasTwoFactorEnabled()) {
            $request->session()->forget(['login.id', 'login.remember']);

            return redirect()->route('login');
        }

        $code = trim((string) $request->input('code'));
        $recoveryCode = trim((string) $request->input('recovery_code'));

        if ($code !== '') {
            if (! $this->twoFactor->verify((string) $user->two_factor_secret, $code)) {
                throw ValidationException::withMessages([
                    'code' => ['The provided two-factor authentication code was invalid.'],
                ]);
            }
        } elseif ($recoveryCode !== '') {
            $recoveryCodes = $user->two_factor_recovery_codes ?? [];
            $matchedIndex = null;

            foreach ($recoveryCodes as $index => $rc) {
                if (hash_equals((string) $rc, $recoveryCode)) {
                    $matchedIndex = $index;
                    break;
                }
            }

            if ($matchedIndex === null) {
                throw ValidationException::withMessages([
                    'recovery_code' => ['The provided two-factor recovery code was invalid.'],
                ]);
            }

            // Single-use: consume matched recovery code
            unset($recoveryCodes[$matchedIndex]);
            $user->forceFill([
                'two_factor_recovery_codes' => array_values($recoveryCodes),
            ])->save();
        } else {
            throw ValidationException::withMessages([
                'code' => ['Please enter a two-factor authentication code or recovery code.'],
            ]);
        }

        $remember = (bool) $request->session()->pull('login.remember', false);
        $request->session()->forget('login.id');

        Auth::login($user, $remember);
        $request->session()->regenerate();

        if ($user->force_password_reset) {
            return redirect()->route('profile.edit')->with('alert', 'Please update your default password to secure your account.');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
