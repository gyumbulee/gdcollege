<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Minimal Student record — the output of admission conversion
     * (Application -> Admission -> Student Account, per §7's diagram).
     * Phase 6 (Student Information System) expands this with enrolments,
     * programme/department/school history, and richer status handling;
     * this table's shape is intentionally left easy to extend rather than
     * duplicated there.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            /** The application this student was converted from. Nullable
             *  because a future direct-entry/transfer student might have
             *  no application record at all. */
            $table->foreignId('application_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('matric_number')->unique();
            $table->foreignId('programme_id')->constrained()->cascadeOnDelete();
            $table->foreignId('admission_academic_session_id')->constrained('academic_sessions')->cascadeOnDelete();
            /** ACTIVE, DEFERRED, SUSPENDED, WITHDRAWN, EXPELLED, GRADUATED — §8. */
            $table->string('status')->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
