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
    Route::get('/work-requests', [WorkRequestApiController::class, 'index'])->name('api.v1.work-requests.index')->middleware('ability:requests:read,requests:write,*');
    Route::post('/work-requests', [WorkRequestApiController::class, 'store'])->name('api.v1.work-requests.store')->middleware('ability:requests:write,*');
    Route::get('/work-requests/{id}', [WorkRequestApiController::class, 'show'])->name('api.v1.work-requests.show')->middleware('ability:requests:read,requests:write,*');
    Route::patch('/work-requests/{id}', [WorkRequestApiController::class, 'update'])->name('api.v1.work-requests.update')->middleware('ability:requests:write,*');
    Route::delete('/work-requests/{id}', [WorkRequestApiController::class, 'destroy'])->name('api.v1.work-requests.destroy')->middleware('ability:requests:write,*');
    Route::post('/work-requests/{id}/restore', [WorkRequestApiController::class, 'restore'])->name('api.v1.work-requests.restore')->middleware('ability:requests:write,*');

    Route::get('/projects', [ProjectApiController::class, 'index'])->name('api.v1.projects.index')->middleware('ability:requests:read,requests:write,*');
});

Route::post('/webhooks/github', GitHubWebhookController::class)->name('api.webhooks.github')->middleware('throttle:60,1');
Route::post('/webhooks/inbound-email', InboundEmailWebhookController::class)->name('api.webhooks.inbound-email')->middleware('throttle:60,1');
