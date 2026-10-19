<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Mandatory production roles and permissions (clean, no demo data)
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Demo workspace and sample accounts are strictly excluded in production
        if (! app()->isProduction()) {
            $this->call([
                IndependentWorkspaceSeeder::class,
                DemoWorkspaceSeeder::class,
            ]);
        }
    }
}
