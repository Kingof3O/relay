<?php

use App\Http\Controllers\Api\V1\ProjectApiController;
use App\Http\Controllers\Api\V1\WorkRequestApiController;
use App\Http\Controllers\GitHubWebhookController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\InboundEmailWebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum,web', 'throttle:60,1'])->group(function (): void {
    Route::get('/search', GlobalSearchController::class)->name('api.search');
});

Route::prefix('v1')->middleware('auth:sanctum')->group(function (): void {
    Route::get('/work-requests', [WorkRequestApiController::class, 'index'])->name('api.v1.work-requests.index');
    Route::post('/work-requests', [WorkRequestApiController::class, 'store'])->name('api.v1.work-requests.store');
    Route::get('/work-requests/{id}', [WorkRequestApiController::class, 'show'])->name('api.v1.work-requests.show');
    Route::patch('/work-requests/{id}', [WorkRequestApiController::class, 'update'])->name('api.v1.work-requests.update');
    Route::delete('/work-requests/{id}', [WorkRequestApiController::class, 'destroy'])->name('api.v1.work-requests.destroy');

    Route::get('/projects', [ProjectApiController::class, 'index'])->name('api.v1.projects.index');
});

Route::post('/webhooks/github', GitHubWebhookController::class)->name('api.webhooks.github');
Route::post('/webhooks/inbound-email', InboundEmailWebhookController::class)->name('api.webhooks.inbound-email');
