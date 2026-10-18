<?php

namespace App\Policies;

use App\Enums\RoleName;
use App\Models\User;
use App\Models\WorkRequest;

final class WorkRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return (bool) $user->active && $user->hasPermission('view_requests');
    }

    public function view(User $user, WorkRequest $request): bool
    {
        return (bool) $user->active && $user->hasPermission('view_requests');
    }

    public function create(User $user): bool
    {
        return (bool) $user->active && $user->hasPermission('create_requests');
    }

    public function update(User $user, WorkRequest $request): bool
    {
        if (! $user->active || ! $user->hasPermission('edit_requests')) {
            return false;
        }

        return $user->role?->name !== RoleName::Designer->value || $request->requester_id === $user->id;
    }

    public function assign(User $user, WorkRequest $request): bool
    {
        return (bool) $user->active && $user->hasPermission('assign_requests');
    }

    public function changeStatus(User $user, WorkRequest $request): bool
    {
        return (bool) $user->active && $user->hasPermission('change_request_status');
    }

    public function comment(User $user, WorkRequest $request): bool
    {
        return $user->hasPermission('comment_requests');
    }

    public function upload(User $user, WorkRequest $request): bool
    {
        return $user->hasPermission('upload_request_files');
    }

    public function delete(User $user, WorkRequest $request): bool
    {
        return $user->hasPermission('delete_requests');
    }
}
