<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Closes the gap ManagementDashboardController::graduationStats()'s own
 * docblock flagged: Student had a GRADUATED status with no supporting
 * date, so a graduation trend wasn't derivable — only a point-in-time
 * total. Set/cleared in StudentController::updateStatus() (the one
 * place a student's status actually changes to/from GRADUATED).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->timestamp('graduated_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('graduated_at');
        });
    }
};
