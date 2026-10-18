<?php

declare(strict_types=1);

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
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

        foreach ($permissions as $name) {
            Permission::query()->firstOrCreate(['name' => $name]);
        }

        $allPermissionIds = Permission::query()->whereIn('name', $permissions)->pluck('id', 'name');

        $owner = Role::query()->where('name', 'Owner')->first();
        if ($owner) {
            $owner->permissions()->syncWithoutDetaching($allPermissionIds->values());
        }

        $developer = Role::query()->where('name', 'Developer')->first();
        if ($developer) {
            $developer->permissions()->syncWithoutDetaching($allPermissionIds->values());
        }

        $designer = Role::query()->where('name', 'Designer')->first();
        if ($designer) {
            $designer->permissions()->syncWithoutDetaching(
                $allPermissionIds->only([
                    'view_requests',
                    'create_requests',
                    'edit_requests',
                    'change_request_status',
                    'comment_requests',
                    'upload_request_files',
                    'delete_requests',
                ])->values()
            );
        }
    }

    public function down(): void
    {
        // Safe no-op to preserve permissions on rollback
    }
};
