<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Role;

final class RoleService
{
    /**
     * @param  array<string, mixed>  $validated
     */
    public function create(array $validated): Role
    {
        $role = new Role;
        $role->name = (string) $validated['name'];
        $role->save();

        $permissionIds = $validated['permission_ids'] ?? [];
        $role->permissions()->sync(is_array($permissionIds) ? $permissionIds : []);

        return $role;
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function update(Role $role, array $validated): Role
    {
        $role->name = (string) $validated['name'];
        $role->save();

        $permissionIds = $validated['permission_ids'] ?? [];
        $role->permissions()->sync(is_array($permissionIds) ? $permissionIds : []);

        return $role;
    }
}
