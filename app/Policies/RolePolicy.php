<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

final class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('manage_roles');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermission('manage_roles');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage_roles');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermission('manage_roles');
    }
}
