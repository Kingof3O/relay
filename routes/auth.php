<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\PasswordController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:6,1');

    Route::get('auth/{provider}/redirect', [\App\Http\Controllers\Auth\SocialAuthController::class, 'redirect'])
        ->name('auth.social.redirect');

    Route::get('auth/{provider}/callback', [\App\Http\Controllers\Auth\SocialAuthController::class, 'callback'])
        ->name('auth.social.callback');
});

Route::middleware(['auth', 'active'])->group(function () {
    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::post('user/two-factor-authentication', [\App\Http\Controllers\Auth\TwoFactorAuthController::class, 'enable'])
        ->name('two-factor.enable');

    Route::post('user/confirmed-two-factor-authentication', [\App\Http\Controllers\Auth\TwoFactorAuthController::class, 'confirm'])
        ->name('two-factor.confirm');

    Route::delete('user/two-factor-authentication', [\App\Http\Controllers\Auth\TwoFactorAuthController::class, 'disable'])
        ->name('two-factor.disable');

    Route::post('user/two-factor-recovery-codes', [\App\Http\Controllers\Auth\TwoFactorAuthController::class, 'regenerateRecoveryCodes'])
        ->name('two-factor.recovery-codes');
});
