<?php

use App\Models\User;
use App\Models\WorkRequest;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function (User $user, int $id): bool {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('workspace.{id}', function (User $user, int $id): bool {
    return $user->workspaces()->where('workspaces.id', $id)->exists();
});

Broadcast::channel('request.{id}', function (User $user, int $id): array|bool {
    $workRequest = WorkRequest::query()->find($id);
    if (! $workRequest) {
        return false;
    }

    if (! $user->workspaces()->where('workspaces.id', $workRequest->workspace_id)->exists()) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
        'username' => $user->username,
    ];
});
