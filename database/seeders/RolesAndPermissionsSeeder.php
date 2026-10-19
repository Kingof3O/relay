<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

final class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_requests',
            'manage_workspace',
            'manage_team',
            'manage_roles',
            'manage_areas',
            'create_requests',
            'edit_requests',
            'assign_requests',
            'change_request_status',
            'comment_requests',
            'upload_request_files',
            'delete_requests',
        ];

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(['name' => $permission]);
        }

        $ownerRole = Role::query()->updateOrCreate(['name' => 'Owner']);
        $adminRole = Role::query()->updateOrCreate(['name' => 'Admin']);
        $developerRole = Role::query()->updateOrCreate(['name' => 'Developer']);
        $designerRole = Role::query()->updateOrCreate(['name' => 'Designer']);
        $memberRole = Role::query()->updateOrCreate(['name' => 'Member']);

        $permissionIds = Permission::query()->whereIn('name', $permissions)->pluck('id', 'name');

        // Assign full permissions to Owner and Admin
        $ownerRole->permissions()->sync($permissionIds->values());
        $adminRole->permissions()->sync($permissionIds->values());

        // Developer has full operational access
        $developerRole->permissions()->sync($permissionIds->values());

        // Designer permissions
        $designerRole->permissions()->sync($permissionIds->only([
            'view_requests',
            'create_requests',
            'edit_requests',
            'change_request_status',
            'comment_requests',
            'upload_request_files',
            'delete_requests',
        ])->values());

        // Standard Member permissions
        $memberRole->permissions()->sync($permissionIds->only([
            'view_requests',
            'create_requests',
            'comment_requests',
            'upload_request_files',
        ])->values());
    }
}
