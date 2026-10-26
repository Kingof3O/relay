<?php

use App\Http\Controllers\AgentHubController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\InvitationAcceptController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PersonalAccessTokenController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RequestCloneController;
use App\Http\Controllers\RequestCommentController;
use App\Http\Controllers\RequestFileController;
use App\Http\Controllers\RequestRelationController;
use App\Http\Controllers\RoadmapController;
use App\Http\Controllers\SavedViewController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\WorkRequestController;
use App\Http\Controllers\WorkspaceController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

Route::get('/invitations/{token}', [InvitationAcceptController::class, 'show'])->name('invitations.accept');
Route::post('/invitations/{token}', [InvitationAcceptController::class, 'store'])->name('invitations.store');

Route::middleware(['auth', 'active'])->group(function (): void {
    Route::post('/workspaces/seed-demo', [WorkspaceController::class, 'seedDemo'])->name('workspaces.seed-demo');
    Route::post('/workspaces/{workspace}/switch', [WorkspaceController::class, 'switch'])->name('workspaces.switch');
    Route::post('/workspaces', [WorkspaceController::class, 'store'])->name('workspaces.store');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/search', GlobalSearchController::class)->name('search')->middleware('throttle:120,1');

    Route::get('/requests', [WorkRequestController::class, 'index'])->name('requests.index');
    Route::post('/requests/bulk', [WorkRequestController::class, 'bulk'])->name('requests.bulk');
    Route::patch('/requests/{request}', [WorkRequestController::class, 'update'])->name('requests.update');
    Route::delete('/requests/{request}', [WorkRequestController::class, 'destroy'])->name('requests.destroy');
    Route::post('/requests/{request}/restore', [WorkRequestController::class, 'restore'])->name('requests.restore')->withTrashed();
    Route::post('/requests/{request}/comments', [RequestCommentController::class, 'store'])->name('requests.comments.store');
    Route::post('/requests/{request}/files', [RequestFileController::class, 'store'])->name('requests.files.store');
    Route::get('/requests/{request}/files/{file}', [RequestFileController::class, 'show'])->name('requests.files.show');
    Route::get('/requests/{request}/files/{file}/preview', [RequestFileController::class, 'preview'])->name('requests.files.preview');
    Route::post('/requests/{request}/files/{file}/retry', [RequestFileController::class, 'retry'])->name('requests.files.retry');
    Route::delete('/requests/{request}/files/{file}', [RequestFileController::class, 'destroy'])->name('requests.files.destroy');
    Route::get('/requests/export', [ExportController::class, 'export'])->name('requests.export');
    Route::post('/requests/{workRequest}/clone', [RequestCloneController::class, 'store'])->name('requests.clone');
    Route::post('/requests/{request}/relations', [RequestRelationController::class, 'store'])->name('requests.relations.store');
    Route::delete('/requests/{request}/relations/{relation}', [RequestRelationController::class, 'destroy'])->name('requests.relations.destroy');
    Route::post('/requests/{workRequest}/subtasks', [SubtaskController::class, 'store'])->name('requests.subtasks.store');
    Route::post('/requests/{workRequest}/subtasks/{subtask}/toggle', [SubtaskController::class, 'toggle'])->name('requests.subtasks.toggle');
    Route::delete('/requests/{workRequest}/subtasks/{subtask}', [SubtaskController::class, 'destroy'])->name('requests.subtasks.destroy');
    Route::get('/requests/{request}', [WorkRequestController::class, 'show'])->name('requests.show');

    // Cycles
    Route::get('/cycles', [CycleController::class, 'index'])->name('cycles.index');
    Route::post('/cycles', [CycleController::class, 'store'])->name('cycles.store');
    Route::post('/cycles/{cycle}/rollover', [CycleController::class, 'rollover'])->name('cycles.rollover');

    // Saved Views
    Route::get('/saved-views', [SavedViewController::class, 'index'])->name('saved-views.index');
    Route::post('/saved-views', [SavedViewController::class, 'store'])->name('saved-views.store');
    Route::delete('/saved-views/{savedView}', [SavedViewController::class, 'destroy'])->name('saved-views.destroy');
    Route::patch('/saved-views/{savedView}/pin', [SavedViewController::class, 'togglePin'])->name('saved-views.pin');

    // Roadmap
    Route::get('/roadmap', [RoadmapController::class, 'index'])->name('roadmap.index');

    // Agent Hub & MCP
    Route::get('/agents', [AgentHubController::class, 'index'])->name('agents.index');

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
        Route::post('/settings/oauth-providers', [SettingsController::class, 'toggleOAuthProvider'])->name('settings.oauth.toggle');

        // Integrations & Notification Templates
        Route::get('/integrations', [IntegrationController::class, 'index'])->name('integrations.index');
        Route::post('/integrations/discord', [IntegrationController::class, 'updateDiscord'])->name('integrations.discord.update');
        Route::post('/integrations/discord/test', [IntegrationController::class, 'testDiscord'])->name('integrations.discord.test');
        Route::post('/integrations/email', [IntegrationController::class, 'updateEmail'])->name('integrations.email.update');
        Route::post('/integrations/email/test', [IntegrationController::class, 'testEmail'])->name('integrations.email.test');
        Route::get('/integrations/email/preview', [IntegrationController::class, 'previewEmail'])->name('integrations.email.preview');
    });

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifications/{notification}/unread', [NotificationController::class, 'unread'])->name('notifications.unread');
    Route::post('/notifications/{notification}/toggle', [NotificationController::class, 'toggle'])->name('notifications.toggle');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/tokens', [PersonalAccessTokenController::class, 'index'])->name('tokens.index');
    Route::post('/tokens', [PersonalAccessTokenController::class, 'store'])->name('tokens.store');
    Route::delete('/tokens/{token}', [PersonalAccessTokenController::class, 'destroy'])->name('tokens.destroy');
    Route::get('/profile/tokens', [PersonalAccessTokenController::class, 'index'])->name('profile.tokens.index');
    Route::post('/profile/tokens', [PersonalAccessTokenController::class, 'store'])->name('profile.tokens.store');
    Route::delete('/profile/tokens/{token}', [PersonalAccessTokenController::class, 'destroy'])->name('profile.tokens.destroy');
});

require __DIR__.'/auth.php';
