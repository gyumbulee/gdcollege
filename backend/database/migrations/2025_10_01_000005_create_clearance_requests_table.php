<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clearance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_session_id')->nullable()->constrained()->nullOnDelete();
            /** PENDING, IN_PROGRESS, COMPLETED, REJECTED — derived from clearance_items, see ClearanceRequest::recomputeStatus(). */
            $table->string('status')->default('PENDING');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clearance_requests');
    }
};
