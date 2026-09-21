<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `is_current` alone answers "which session is the institution running
 * right now" (course registration, results, etc.) — it says nothing
 * about whether that session is *currently accepting new applications*.
 * These two nullable timestamps are that separate, genuinely date-driven
 * gate: both null means "open with no bound on that side" (matches
 * today's behaviour exactly, so existing sessions are unaffected by this
 * migration). See AcademicSession::isAcceptingApplications().
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_sessions', function (Blueprint $table) {
            $table->timestamp('admissions_open_at')->nullable()->after('is_current');
            $table->timestamp('admissions_close_at')->nullable()->after('admissions_open_at');
        });
    }

    public function down(): void
    {
        Schema::table('academic_sessions', function (Blueprint $table) {
            $table->dropColumn(['admissions_open_at', 'admissions_close_at']);
        });
    }
};
