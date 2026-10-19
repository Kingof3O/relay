<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

final class RelayRestoreCommand extends Command
{
    protected $signature = 'relay:restore
        {file : Path to the SQL backup dump or zip archive}
        {--force : Force restoration without confirmation prompt}';

    protected $description = 'Restore the Relay Studio database or attachment storage from a backup archive';

    public function handle(): int
    {
        $file = (string) $this->argument('file');

        if (! file_exists($file)) {
            $this->error("Backup file not found: {$file}");

            return self::FAILURE;
        }

        if (! $this->option('force') && ! $this->confirm('WARNING: Restoring will overwrite existing data. Are you sure you wish to proceed?')) {
            $this->line('Restoration cancelled.');

            return self::SUCCESS;
        }

        $this->info("Restoring from backup: {$file}...");

        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        if ($ext === 'sql') {
            $sql = File::get($file);
            DB::unprepared($sql);
            $this->info(' Database restored successfully from SQL dump.');
        } elseif ($ext === 'sqlite') {
            $driver = config('database.default');
            if ($driver === 'sqlite') {
                $target = config('database.connections.sqlite.database');
                File::copy($file, $target);
                $this->info(" SQLite database file restored to {$target}.");
            } else {
                $this->error("Current database connection is [{$driver}], but backup is a SQLite file.");

                return self::FAILURE;
            }
        } elseif ($ext === 'zip') {
            $storageDir = storage_path('app/public');
            $zip = new \ZipArchive;
            if ($zip->open($file) === true) {
                $zip->extractTo($storageDir);
                $zip->close();
                $this->info(" Attachments extracted to {$storageDir}.");
            } else {
                $this->error('Failed to open zip archive.');

                return self::FAILURE;
            }
        } else {
            $this->error("Unsupported backup file extension: .{$ext}");

            return self::FAILURE;
        }

        $this->callSilent('cache:clear');
        $this->newLine();
        $this->info('Relay Studio restoration completed successfully.');

        return self::SUCCESS;
    }
}
