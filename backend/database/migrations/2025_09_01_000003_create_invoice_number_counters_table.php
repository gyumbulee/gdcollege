<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Same locked-counter pattern as matric_number_counters/application_number_counters. */
    public function up(): void
    {
        Schema::create('invoice_number_counters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_session_id')->unique()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('next_sequence')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_number_counters');
    }
};
