<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// 1. Agile Cycle Rollover (Configurable via RELAY_AUTO_ROLLOVER_ENABLED)
if (config('relay.agile.auto_rollover_enabled', true)) {
    Schedule::command('relay:cycle-rollover')
        ->dailyAt(config('relay.agile.rollover_time', '00:05'))
        ->withoutOverlapping();
}

// 2. Automated Backups (Configurable via RELAY_BACKUP_ENABLED & RELAY_BACKUP_SCHEDULE)
if (config('relay.backup.enabled', false)) {
    $includeFiles = config('relay.backup.include_files', false);
    $command = $includeFiles ? 'relay:backup' : 'relay:backup --only-db';

    Schedule::command($command)
        ->cron(config('relay.backup.schedule', '0 2 * * *'))
        ->withoutOverlapping();
}
