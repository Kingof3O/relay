<?php

use Illuminate\Support\Facades\Route;

Route::get('/search', \App\Http\Controllers\GlobalSearchController::class)->name('api.search');
Route::post('/webhooks/github', \App\Http\Controllers\GitHubWebhookController::class)->name('api.webhooks.github');
