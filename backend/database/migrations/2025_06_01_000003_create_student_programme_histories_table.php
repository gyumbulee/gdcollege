<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A record of every programme transfer — old and new programme are
     * BOTH kept (§36: "Keep old and new programme history"), never
     * overwritten in place.
     */
    public function up(): void
    {
        Schema::create('student_programme_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_programme_id')->nullable()->constrained('programmes')->nullOnDelete();
            $table->foreignId('to_programme_id')->constrained('programmes')->cascadeOnDelete();
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->constrained('users')->cascadeOnDelete();
            $table->timestamp('changed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_programme_histories');
    }
};
