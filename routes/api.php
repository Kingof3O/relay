<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum,web', 'throttle:60,1'])->group(function (): void {
    Route::get('/search', \App\Http\Controllers\GlobalSearchController::class)->name('api.search');
});

Route::post('/webhooks/github', \App\Http\Controllers\GitHubWebhookController::class)->name('api.webhooks.github');
