<?php

namespace App\Console\Commands;

use App\Models\Semester;
use App\Models\Student;
use App\Services\NotificationDispatcher;
use Illuminate\Console\Command;

/**
 * §25's "Course registration opened" is genuinely date-driven (a
 * semester's `registration_opens_at` simply arrives — see
 * Semester::registration_opens_at), unlike an admission decision or a
 * payment confirmation, which happen inside a request. This command is
 * what actually notices the moment has arrived — see routes/console.php
 * for how often it runs, and backend/README.md for the real
 * infrastructure requirement (a cron entry calling `php artisan
 * schedule:run` every minute) that makes this fire at all in
 * production. Without that cron entry, this command exists in code but
 * never actually runs — same category of gap as `storage:link`: correct
 * code, missing infra step.
 */
class NotifyRegistrationOpened extends Command
{
    protected $signature = 'notify:registration-opened';

    protected $description = "Notify active students when a semester's course registration window opens (run on a schedule, not manually)";

    public function handle(NotificationDispatcher $notifications): int
    {
        $semesters = Semester::whereNotNull('registration_opens_at')
            ->where('registration_opens_at', '<=', now())
            ->whereNull('registration_opened_notified_at')
            ->get();

        foreach ($semesters as $semester) {
            $userIds = Student::where('status', Student::STATUS_ACTIVE)->pluck('user_id');

            $notifications->toUsers(
                $userIds,
                'course_registrations.opened',
                'Course registration is now open',
                "Registration for {$semester->name} is now open.",
                '/student/registration'
            );

            $semester->update(['registration_opened_notified_at' => now()]);

            $this->info("Notified {$userIds->count()} students — {$semester->name}.");
        }

        if ($semesters->isEmpty()) {
            $this->info('No semester currently needs a registration-opened notification.');
        }

        return self::SUCCESS;
    }
}
