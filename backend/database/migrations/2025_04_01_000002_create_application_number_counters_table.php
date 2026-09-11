<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per academic session, holding the next sequence number for
     * that session's application numbers. Incremented inside a locking
     * transaction (see ApplicationNumberGenerator) so concurrent
     * submissions never collide — same pattern the spec asks for with
     * matriculation numbers (§36).
     */
    public function up(): void
    {
        Schema::create('application_number_counters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_session_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('next_sequence')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_number_counters');
    }
};
