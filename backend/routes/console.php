<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * Running this schedule at all requires one cron entry on the server —
 * same category of requirement as `php artisan storage:link` (see
 * backend/README.md's "File storage" section for that one; this is the
 * equivalent note for scheduling):
 *
 *   * * * * * cd /path-to-backend && php artisan schedule:run >> /dev/null 2>&1
 *
 * Locally, `php artisan schedule:work` does the same job without a
 * real cron entry, for as long as that command keeps running. See
 * App\Console\Commands\NotifyRegistrationOpened for what this actually
 * does and why it has to be schedule-driven rather than firing inside
 * a request, unlike every other §25 notification trigger.
 */
Schedule::command('notify:registration-opened')->everyFifteenMinutes();
