<?php

declare(strict_types=1);

namespace Tests\Feature;

use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

final class BackupRestoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_relay_backup_command_creates_backup_files(): void
    {
        $backupDir = storage_path('framework/testing/test_backups');
        if (File::isDirectory($backupDir)) {
            File::deleteDirectory($backupDir);
        }

        $this->artisan('relay:backup', ['--output' => $backupDir])
            ->assertSuccessful();

        $this->assertTrue(File::isDirectory($backupDir));
        $files = File::files($backupDir);
        $this->assertNotEmpty($files);

        // Cleanup
        File::deleteDirectory($backupDir);
    }

    public function test_relay_restore_fails_gracefully_when_file_not_found(): void
    {
        $this->artisan('relay:restore', [
            'file' => '/non/existent/path/relay_backup.sql',
            '--force' => true,
        ])->assertFailed();
    }
}
