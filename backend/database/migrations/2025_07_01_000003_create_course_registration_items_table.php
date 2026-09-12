<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_registration_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_registration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_offering_id')->constrained()->cascadeOnDelete();
            /**
             * True when this offering's level differs from the student's
             * level at the time of registration — a carryover proxy. Real
             * pass/fail-based carryover detection needs Results (Phase 8),
             * which doesn't exist yet; see CourseRegistrationService.
             */
            $table->boolean('is_carryover')->default(false);
            $table->timestamps();

            $table->unique(['course_registration_id', 'course_offering_id'], 'no_duplicate_offering_per_registration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_registration_items');
    }
};
