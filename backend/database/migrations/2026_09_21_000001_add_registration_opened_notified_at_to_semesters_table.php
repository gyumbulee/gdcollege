<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * §25's "Course registration opened" notification is genuinely
 * date-driven (the window opens itself when `registration_opens_at`
 * arrives — see AcademicSession's own admissions_open_at/close_at for
 * the identical pattern), so nothing in a request/response cycle is
 * "the moment it happened" the way an admission decision or a payment
 * confirmation is. This column is how the scheduled command
 * (App\Console\Commands\NotifyRegistrationOpened, run every few minutes
 * — see routes/console.php) avoids notifying the same semester's
 * students twice across repeated runs.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->timestamp('registration_opened_notified_at')->nullable()->after('registration_closes_at');
        });
    }

    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropColumn('registration_opened_notified_at');
        });
    }
};
