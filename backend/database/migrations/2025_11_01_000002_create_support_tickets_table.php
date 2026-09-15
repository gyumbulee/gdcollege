<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            // user_id, not student_id — §28 explicitly covers both
            // students AND applicants, and both are Users; scoping to
            // student_id would exclude applicants entirely.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category');
            $table->string('subject');
            $table->text('description');
            /** LOW, MEDIUM, HIGH, URGENT. */
            $table->string('priority')->default('MEDIUM');
            /** OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED — §28's exact list. */
            $table->string('status')->default('OPEN');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
