<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

final class RelayBackupCommand extends Command
{
    protected $signature = 'relay:backup
        {--only-db : Backup database only}
        {--only-files : Backup attachment files only}
        {--include-files : Include media and file attachments in the archive}
        {--output= : Custom destination path for backup}
        {--force : Force backup execution even if disabled in configuration}';

    protected $description = 'Generate a standalone, portable backup archive of the Relay Studio database and file attachments';

    public function handle(): int
    {
        $this->info('Starting Relay Studio production backup procedure...');

        if (! config('relay.backup.enabled', true) && ! $this->option('force')) {
            $this->warn('Notice: Automated backups are set to false (RELAY_BACKUP_ENABLED=false).');
            $this->line('Proceeding with on-demand manual backup...');
        }

        $backupDir = $this->option('output') ?: (config('relay.backup.destination') ?: storage_path('app/backups'));
        if (! File::isDirectory($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $timestamp = now()->format('Y-m-d_His');
        $onlyDb = (bool) $this->option('only-db');
        $onlyFiles = (bool) $this->option('only-files');
        $includeFiles = (bool) $this->option('include-files') || (bool) config('relay.backup.include_files', false);

        if (! $onlyDb && ! $onlyFiles && ! $includeFiles) {
            $onlyDb = true; // Default to lightweight DB-only backup when include_files is false
        }

        $driver = config('database.default');
        $createdFiles = [];

        // 1. Database Backup
        if (! $onlyFiles) {
            $dbFilename = "relay_db_{$driver}_{$timestamp}.sql";
            $dbPath = "{$backupDir}/{$dbFilename}";

            $this->line("Dumping database tables (<fg=cyan>{$driver}</>)...");

            if ($driver === 'sqlite') {
                $sourceDb = config('database.connections.sqlite.database');
                if (file_exists($sourceDb)) {
                    $sqliteFilename = "relay_db_sqlite_{$timestamp}.sqlite";
                    $targetPath = "{$backupDir}/{$sqliteFilename}";
                    File::copy($sourceDb, $targetPath);
                    $createdFiles[] = $targetPath;
                    $this->info(" SQLite database backed up ({$sqliteFilename}).");
                } else {
                    $this->error(" SQLite database file not found: {$sourceDb}");
                }
            } else {
                $this->exportTablesViaPdo($dbPath);
                $createdFiles[] = $dbPath;
                $this->info(" Database dump generated ({$dbFilename}).");
            }
        }

        // 2. Attachments Archive
        if (! $onlyDb) {
            $storageDir = storage_path('app/public');
            if (File::isDirectory($storageDir)) {
                $files = File::allFiles($storageDir);
                if (! empty($files)) {
                    $filesArchiveName = "relay_attachments_{$timestamp}.zip";
                    $filesArchivePath = "{$backupDir}/{$filesArchiveName}";

                    $this->line('Archiving attachments and media assets...');

                    if (class_exists(\ZipArchive::class)) {
                        $zip = new \ZipArchive;
                        if ($zip->open($filesArchivePath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
                            foreach ($files as $file) {
                                $zip->addFile($file->getRealPath(), $file->getRelativePathname());
                            }
                            $zip->close();
                            if (file_exists($filesArchivePath)) {
                                $createdFiles[] = $filesArchivePath;
                                $this->info(" Attachments zip created ({$filesArchiveName}).");
                            }
                        }
                    }
                }
            }
        }

        // 3. Automated Retention Pruning
        $retentionDays = (int) config('relay.backup.retention_days', 14);
        if ($retentionDays > 0) {
            $this->pruneOldBackups($backupDir, $retentionDays);
        }

        $this->newLine();
        $this->info('=== Relay Studio Backup Summary ===');
        foreach ($createdFiles as $file) {
            if (file_exists($file)) {
                $size = round(filesize($file) / 1024, 2);
                $this->line(" - <fg=green>{$file}</> ({$size} KB)");
            }
        }
        $this->newLine();

        return self::SUCCESS;
    }

    private function pruneOldBackups(string $backupDir, int $retentionDays): void
    {
        $cutoff = now()->subDays($retentionDays)->getTimestamp();
        $files = File::files($backupDir);
        $prunedCount = 0;

        foreach ($files as $file) {
            $extension = strtolower($file->getExtension());
            if (in_array($extension, ['sql', 'sqlite', 'zip'], true)) {
                if ($file->getMTime() < $cutoff) {
                    File::delete($file->getRealPath());
                    $prunedCount++;
                }
            }
        }

        if ($prunedCount > 0) {
            $this->line("<fg=yellow>Pruned {$prunedCount} backup archive(s) older than {$retentionDays} days.</>");
        }
    }

    private function getTableNames(): array
    {
        $driver = config('database.default');
        if ($driver === 'sqlite') {
            return collect(DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"))
                ->pluck('name')
                ->values()
                ->all();
        }

        if ($driver === 'mysql') {
            return collect(DB::select('SELECT table_name FROM information_schema.tables WHERE table_schema = ?', [DB::connection()->getDatabaseName()]))
                ->pluck('table_name')
                ->values()
                ->all();
        }

        if ($driver === 'pgsql') {
            return collect(DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public'"))
                ->pluck('tablename')
                ->values()
                ->all();
        }

        return [];
    }

    private function exportTablesViaPdo(string $targetFile): void
    {
        $tables = $this->getTableNames();
        $handle = fopen($targetFile, 'w');

        fwrite($handle, "-- Relay Studio Portable Database Backup\n");
        fwrite($handle, '-- Generated: '.now()->toIso8601String()."\n\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS = 0;\n\n");

        foreach ($tables as $table) {
            $rows = DB::table($table)->get();
            if ($rows->isEmpty()) {
                continue;
            }
            fwrite($handle, "-- Table: {$table} (".count($rows)." rows)\n");
            foreach ($rows as $row) {
                $rowArr = (array) $row;
                $columns = implode(', ', array_map(fn ($c) => "`{$c}`", array_keys($rowArr)));
                $values = implode(', ', array_map(function ($val) {
                    if ($val === null) {
                        return 'NULL';
                    }

                    return DB::getPdo()->quote((string) $val);
                }, array_values($rowArr)));

                fwrite($handle, "INSERT INTO `{$table}` ({$columns}) VALUES ({$values});\n");
            }
            fwrite($handle, "\n");
        }

        fwrite($handle, "SET FOREIGN_KEY_CHECKS = 1;\n");
        fclose($handle);
    }
}
