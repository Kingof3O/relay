<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Console\Command;
use Illuminate\Database\DatabaseManager;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

final class WorkspaceReset extends Command
{
    protected $signature = 'workspace:reset {--force : Skip the confirmation prompt}';

    protected $description = 'Permanently remove the current workspace and seed the configured five-user workspace';

    public function handle(DatabaseManager $database): int
    {
        if (! $this->option('force') && ! $this->confirm(
            'This permanently deletes all users, requests, legacy project data, activity, notifications, and uploaded files. Continue?',
        )) {
            $this->info('Workspace reset cancelled.');

            return self::SUCCESS;
        }

        $this->components->warn('Resetting the workspace. This cannot be undone.');

        Schema::disableForeignKeyConstraints();

        try {
            foreach ([
                'request_files',
                'request_activities',
                'requests',
                'notifications',
                'files',
                'tasks',
                'follow_ups',
                'ideas',
                'projects',
                'jobs',
                'job_batches',
                'failed_jobs',
                'sessions',
                'cache_locks',
                'cache',
                'role_permission',
                'users',
                'permissions',
                'roles',
            ] as $table) {
                if (Schema::hasTable($table)) {
                    $database->table($table)->truncate();
                }
            }
        } finally {
            Schema::enableForeignKeyConstraints();
        }

        $local = Storage::disk('local');
        foreach (['requests', 'request-staging', 'projects'] as $directory) {
            $local->deleteDirectory($directory);
        }

        app(IndependentWorkspaceSeeder::class)->run();

        $this->components->info('Workspace reset complete. Five configured accounts and six projects are ready.');

        return self::SUCCESS;
    }
}
