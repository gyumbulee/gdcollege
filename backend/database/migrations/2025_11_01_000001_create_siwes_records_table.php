<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('siwes_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('organization_name');
            $table->text('organization_address')->nullable();
            $table->string('supervisor_name')->nullable();
            $table->string('supervisor_phone')->nullable();
            $table->string('supervisor_email')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            /** PENDING, ACTIVE, COMPLETED, TERMINATED. */
            $table->string('status')->default('PENDING');
            // Detailed logbook functionality is explicitly deferred by
            // the spec ("can be enabled as a later phase") — this is
            // just the placement record + a single overall assessment,
            // not a weekly-entry logbook.
            $table->unsignedTinyInteger('assessment_score')->nullable();
            $table->text('assessment_remark')->nullable();
            $table->foreignId('assessed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assessed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('siwes_records');
    }
};
