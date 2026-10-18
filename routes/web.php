<?php

use App\Http\Controllers\AreaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RequestCommentController;
use App\Http\Controllers\RequestFileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\WorkRequestController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/invitations/{token}', [\App\Http\Controllers\InvitationAcceptController::class, 'show'])->name('invitations.accept');
Route::post('/invitations/{token}', [\App\Http\Controllers\InvitationAcceptController::class, 'store'])->name('invitations.store');

Route::middleware(['auth', 'active'])->group(function (): void {
    Route::post('/workspaces/{workspace}/switch', [\App\Http\Controllers\WorkspaceController::class, 'switch'])->name('workspaces.switch');
    Route::post('/workspaces', [\App\Http\Controllers\WorkspaceController::class, 'store'])->name('workspaces.store');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::get('/requests', [WorkRequestController::class, 'index'])->name('requests.index');
    Route::post('/requests/bulk', [WorkRequestController::class, 'bulk'])->name('requests.bulk');
    Route::patch('/requests/{request}', [WorkRequestController::class, 'update'])->name('requests.update');
    Route::delete('/requests/{request}', [WorkRequestController::class, 'destroy'])->name('requests.destroy');
    Route::post('/requests/{request}/comments', [RequestCommentController::class, 'store'])->name('requests.comments.store');
    Route::post('/requests/{request}/files', [RequestFileController::class, 'store'])->name('requests.files.store');
    Route::get('/requests/{request}/files/{file}', [RequestFileController::class, 'show'])->name('requests.files.show');
    Route::get('/requests/{request}/files/{file}/preview', [RequestFileController::class, 'preview'])->name('requests.files.preview');
    Route::get('/requests/export', [\App\Http\Controllers\ExportController::class, 'export'])->name('requests.export');
    Route::post('/requests/{workRequest}/clone', [\App\Http\Controllers\RequestCloneController::class, 'store'])->name('requests.clone');
    Route::post('/requests/{request}/relations', [\App\Http\Controllers\RequestRelationController::class, 'store'])->name('requests.relations.store');
    Route::delete('/requests/{request}/relations/{relation}', [\App\Http\Controllers\RequestRelationController::class, 'destroy'])->name('requests.relations.destroy');
    Route::post('/requests/{workRequest}/subtasks', [\App\Http\Controllers\SubtaskController::class, 'store'])->name('requests.subtasks.store');
    Route::post('/requests/{workRequest}/subtasks/{subtask}/toggle', [\App\Http\Controllers\SubtaskController::class, 'toggle'])->name('requests.subtasks.toggle');
    Route::delete('/requests/{workRequest}/subtasks/{subtask}', [\App\Http\Controllers\SubtaskController::class, 'destroy'])->name('requests.subtasks.destroy');
    Route::get('/requests/{request}', [WorkRequestController::class, 'show'])->name('requests.show');

    // Cycles
    Route::get('/cycles', [\App\Http\Controllers\CycleController::class, 'index'])->name('cycles.index');
    Route::post('/cycles', [\App\Http\Controllers\CycleController::class, 'store'])->name('cycles.store');
    Route::post('/cycles/{cycle}/rollover', [\App\Http\Controllers\CycleController::class, 'rollover'])->name('cycles.rollover');

    // Saved Views
    Route::get('/saved-views', [\App\Http\Controllers\SavedViewController::class, 'index'])->name('saved-views.index');
    Route::post('/saved-views', [\App\Http\Controllers\SavedViewController::class, 'store'])->name('saved-views.store');
    Route::delete('/saved-views/{savedView}', [\App\Http\Controllers\SavedViewController::class, 'destroy'])->name('saved-views.destroy');
    Route::patch('/saved-views/{savedView}/pin', [\App\Http\Controllers\SavedViewController::class, 'togglePin'])->name('saved-views.pin');

    // Roadmap
    Route::get('/roadmap', [\App\Http\Controllers\RoadmapController::class, 'index'])->name('roadmap.index');

    Route::middleware('permission:manage_workspace')->group(function (): void {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('/settings/projects', [AreaController::class, 'store'])->name('settings.projects.store');
        Route::patch('/settings/projects/{area}', [AreaController::class, 'update'])->name('settings.projects.update');
        Route::post('/settings/projects/reorder', [AreaController::class, 'reorder'])->name('settings.projects.reorder');
        Route::delete('/settings/projects/{area}', [AreaController::class, 'destroy'])->name('settings.projects.destroy');
        Route::post('/settings/team', [TeamMemberController::class, 'store'])->name('settings.team.store');
        Route::post('/settings/team/invite', [TeamMemberController::class, 'invite'])->name('settings.team.invite');
        Route::patch('/settings/team/{user}', [TeamMemberController::class, 'update'])->name('settings.team.update');
        Route::delete('/settings/team/{user}', [TeamMemberController::class, 'destroy'])->name('settings.team.destroy');
    });

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifications/{notification}/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post('/notifications/{notification}/toggle', [NotificationController::class, 'toggle'])->name('notifications.toggle');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__.'/auth.php';
