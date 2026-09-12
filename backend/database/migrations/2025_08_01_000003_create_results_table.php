<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per student per course offering. `component_scores` stores
     * {"<component name>": score} — keyed by result_components.name
     * rather than a separate scores-per-component join table, to avoid an
     * extra table for what is, in practice, a tiny fixed-per-institution
     * set of components (documented simplification — see
     * docs/PROJECT_STATUS.md if this needs revisiting for an institution
     * with per-course-varying components).
     *
     * Status pipeline exactly matches §12: DRAFT -> SUBMITTED -> REVIEWED
     * (HOD) -> VERIFIED (Academic Officer) -> APPROVED -> PUBLISHED
     * (locked, visible to the student). Published results are never
     * edited in place — see result_corrections in a later phase.
     */
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_offering_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->json('component_scores')->nullable();
            $table->decimal('total_score', 5, 2)->nullable();
            $table->string('grade', 5)->nullable();
            $table->decimal('grade_point', 3, 2)->nullable();
            $table->string('status')->default('DRAFT');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['course_offering_id', 'student_id'], 'one_result_per_student_per_offering');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};
