<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

final class IndependentWorkspaceSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_requests',
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
        $developerRole = Role::query()->updateOrCreate(['name' => 'Developer']);
        $designerRole = Role::query()->updateOrCreate(['name' => 'Designer']);

        $permissionIds = Permission::query()->whereIn('name', $permissions)->pluck('id', 'name');
        $ownerRole->permissions()->sync($permissionIds->values());
        $developerRole->permissions()->sync($permissionIds->values());
        $designerRole->permissions()->sync($permissionIds->only([
            'view_requests',
            'create_requests',
            'edit_requests',
            'change_request_status',
            'comment_requests',
            'upload_request_files',
            'delete_requests',
        ])->values());

        // Default studio team accounts (no env required, optional overrides allowed)
        $accounts = [
            [
                'prefix' => 'OWNER',
                'username' => 'robin',
                'name' => 'Robin (Owner)',
                'email' => 'robin@relay.studio',
                'role' => $ownerRole,
            ],
            [
                'prefix' => 'MAIN_DEV',
                'username' => 'hussien',
                'name' => 'Hussien (Lead Dev)',
                'email' => 'hussien@relay.studio',
                'role' => $developerRole,
            ],
            [
                'prefix' => 'BROTHER',
                'username' => 'brother',
                'name' => 'Brother (Developer)',
                'email' => 'brother@relay.studio',
                'role' => $developerRole,
            ],
            [
                'prefix' => 'DESIGNER_1',
                'username' => 'designer-1',
                'name' => 'Maya (UI/UX Designer)',
                'email' => 'designer1@relay.studio',
                'role' => $designerRole,
            ],
            [
                'prefix' => 'DESIGNER_2',
                'username' => 'designer-2',
                'name' => 'Alex (Motion Designer)',
                'email' => 'designer2@relay.studio',
                'role' => $designerRole,
            ],
        ];

        foreach ($accounts as $account) {
            $prefix = $account['prefix'];
            $username = env("STM_{$prefix}_USERNAME") ?: $account['username'];
            $name = env("STM_{$prefix}_NAME") ?: $account['name'];
            $email = env("STM_{$prefix}_EMAIL") ?: $account['email'];
            $password = env("STM_{$prefix}_PASSWORD") ?: 'password';

            $user = User::query()->updateOrCreate(
                ['username' => $username],
                [
                    'name' => $name,
                    'email' => $email,
                    'password' => $password,
                    'role_id' => $account['role']->id,
                    'active' => true,
                ],
            );

            if ($user->role_id !== $account['role']->id || $user->active !== true) {
                $user->forceFill([
                    'role_id' => $account['role']->id,
                    'active' => true,
                ])->save();
            }
        }

        $areas = [
            ['name' => 'LMS', 'color' => '#8B5CF6'],
            ['name' => 'Morph', 'color' => '#06B6D4'],
            ['name' => 'Transfers', 'color' => '#10B981'],
            ['name' => 'Imposter', 'color' => '#F59E0B'],
            ['name' => 'App', 'color' => '#EC4899'],
            ['name' => 'New Game', 'color' => '#3B82F6'],
        ];

        foreach ($areas as $index => $item) {
            Area::query()->updateOrCreate(
                ['slug' => str($item['name'])->slug()->toString()],
                [
                    'name' => $item['name'],
                    'color' => $item['color'],
                    'sort_order' => $index,
                    'archived_at' => null,
                ],
            );
        }
    }
}
