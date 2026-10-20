<?php

use App\Http\Controllers\Api\V1\BriefingApiController;
use App\Http\Controllers\Api\V1\CycleApiController;
use App\Http\Controllers\Api\V1\ProjectApiController;
use App\Http\Controllers\Api\V1\WorkRequestApiController;
use App\Http\Controllers\Api\V1\WorkRequestCommentApiController;
use App\Http\Controllers\GitHubWebhookController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\InboundEmailWebhookController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum,web', 'throttle:60,1'])->group(function (): void {
    Route::get('/search', GlobalSearchController::class)->name('api.search');
});

Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1'])->group(function (): void {
    // Daily Briefing Endpoint (Morning Catch-Up)
    Route::get('/briefing', BriefingApiController::class)->name('api.v1.briefing')->middleware('ability:requests:read,requests:write,*');

    // Work Requests CRUD
    Route::get('/work-requests', [WorkRequestApiController::class, 'index'])->name('api.v1.work-requests.index')->middleware('ability:requests:read,requests:write,*');
    Route::post('/work-requests', [WorkRequestApiController::class, 'store'])->name('api.v1.work-requests.store')->middleware('ability:requests:write,*');
    Route::get('/work-requests/{id}', [WorkRequestApiController::class, 'show'])->name('api.v1.work-requests.show')->middleware('ability:requests:read,requests:write,*');
    Route::patch('/work-requests/{id}', [WorkRequestApiController::class, 'update'])->name('api.v1.work-requests.update')->middleware('ability:requests:write,*');
    Route::delete('/work-requests/{id}', [WorkRequestApiController::class, 'destroy'])->name('api.v1.work-requests.destroy')->middleware('ability:requests:write,*');
    Route::post('/work-requests/{id}/restore', [WorkRequestApiController::class, 'restore'])->name('api.v1.work-requests.restore')->middleware('ability:requests:write,*');

    // Work Request Comments & Discussions
    Route::get('/work-requests/{id}/comments', [WorkRequestCommentApiController::class, 'index'])->name('api.v1.work-requests.comments.index')->middleware('ability:requests:read,requests:write,*');
    Route::post('/work-requests/{id}/comments', [WorkRequestCommentApiController::class, 'store'])->name('api.v1.work-requests.comments.store')->middleware('ability:requests:write,*');

    // Projects / Areas
    Route::get('/projects', [ProjectApiController::class, 'index'])->name('api.v1.projects.index')->middleware('ability:requests:read,requests:write,*');

    // Agile Cycles / Sprints
    Route::get('/cycles', [CycleApiController::class, 'index'])->name('api.v1.cycles.index')->middleware('ability:requests:read,requests:write,*');
    Route::get('/cycles/current', [CycleApiController::class, 'current'])->name('api.v1.cycles.current')->middleware('ability:requests:read,requests:write,*');
});

Route::post('/webhooks/github', GitHubWebhookController::class)->name('api.webhooks.github')->middleware('throttle:60,1');
Route::post('/webhooks/inbound-email', InboundEmailWebhookController::class)->name('api.webhooks.inbound-email')->middleware('throttle:60,1');
