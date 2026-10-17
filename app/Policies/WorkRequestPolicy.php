<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WorkRequest;

final class WorkRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, WorkRequest $request): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create_requests');
    }

    public function update(User $user, WorkRequest $request): bool
    {
        if (! $user->hasPermission('edit_requests')) {
            return false;
        }

        return $user->role?->name !== 'Designer' || $request->requester_id === $user->id;
    }

    public function assign(User $user, WorkRequest $request): bool
    {
        return $user->hasPermission('assign_requests');
    }

    public function changeStatus(User $user, WorkRequest $request): bool
    {
        return $user->hasPermission('change_request_status');
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
