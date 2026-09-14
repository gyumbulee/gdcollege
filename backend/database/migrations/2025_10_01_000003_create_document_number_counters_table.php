<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Same locked-counter pattern as invoice/matric/application numbers, keyed by document type. */
    public function up(): void
    {
        Schema::create('document_number_counters', function (Blueprint $table) {
            $table->id();
            $table->string('type')->unique();
            $table->unsignedInteger('next_sequence')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_number_counters');
    }
};
