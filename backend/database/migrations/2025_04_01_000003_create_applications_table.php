<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('programme_id')->nullable()->constrained()->nullOnDelete();
            $table->string('application_number')->unique();
            /**
             * DRAFT, PAYMENT_PENDING, PAYMENT_CONFIRMED, SUBMITTED,
             * UNDER_REVIEW, SHORTLISTED, ADMITTED, REJECTED, ON_HOLD,
             * WITHDRAWN — see Master Implementation Brief §6.
             */
            $table->string('status')->default('DRAFT');
            /**
             * Fee tracking only — actual payment verification is wired in
             * Phase 13 (Payment Gateway). Submission does NOT currently
             * require fee_paid=true; see AdmissionsConfig and
             * ApplicationController::submit() for why, and what changes
             * once Phase 13 lands.
             */
            $table->boolean('fee_paid')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
