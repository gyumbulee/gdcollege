<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per session a student is enrolled in — NEVER deleted or
     * overwritten when a student progresses. Master Implementation Brief
     * §36: "If a student progresses 2025/2026 — ND I, 2026/2027 — ND II,
     * retain both enrolments." Programme/level are captured per-row
     * (not just looked up from `students.programme_id`) so a later
     * programme transfer doesn't rewrite this session's history.
     */
    public function up(): void
    {
        Schema::create('student_enrolments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('programme_id')->constrained()->cascadeOnDelete();
            $table->foreignId('level_id')->constrained()->cascadeOnDelete();
            /** ACTIVE, COMPLETED, CARRIED_OVER, DEFERRED — this session only. */
            $table->string('status')->default('ACTIVE');
            $table->timestamps();

            $table->unique(['student_id', 'academic_session_id'], 'student_enrolment_one_per_session');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrolments');
    }
};
