<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

final class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Project $project): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('create_projects');
    }

    public function update(User $user, Project $project): bool
    {
        return $user->hasPermission('edit_projects');
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->hasPermission('delete_projects');
    }
}
