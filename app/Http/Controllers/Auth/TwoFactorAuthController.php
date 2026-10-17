<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

final class TwoFactorAuthController extends Controller
{
    public function __construct(private readonly TwoFactorService $twoFactor)
    {
    }

    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $secret = $this->twoFactor->generateSecret();
        $recoveryCodes = $this->twoFactor->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => $recoveryCodes,
            'two_factor_confirmed_at' => null,
        ])->save();

        $holder = $user->email ?: $user->username;
        $qrSvg = $this->twoFactor->getQrCodeSvg(config('app.name', 'Relay Studio'), $holder, $secret);

        return response()->json([
            'status' => 'enabled_pending_confirmation',
            'secret' => $secret,
            'qr_svg' => $qrSvg,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();
        if (! $user || blank($user->two_factor_secret)) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor authentication is not currently pending enablement.'],
            ]);
        }

        if (! $this->twoFactor->verify((string) $user->two_factor_secret, (string) $request->input('code'))) {
            throw ValidationException::withMessages([
                'code' => ['The provided two-factor authentication code was invalid.'],
            ]);
        }

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();

        return response()->json([
            'status' => 'confirmed',
            'recovery_codes' => $user->two_factor_recovery_codes,
        ]);
    }

    public function disable(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return response()->json([
            'status' => 'disabled',
        ]);
    }

    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            abort(401);
        }

        if (! $user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'Two-factor authentication is not enabled.',
            ], 422);
        }

        $recoveryCodes = $this->twoFactor->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_recovery_codes' => $recoveryCodes,
        ])->save();

        return response()->json([
            'status' => 'recovery_codes_regenerated',
            'recovery_codes' => $recoveryCodes,
        ]);
    }
}
