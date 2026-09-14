<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('academic_session_id')->constrained()->cascadeOnDelete();
            // Nullable programme/level = applies broadly (e.g. an
            // institution-wide "Library Fee" structure) rather than one
            // narrow programme/level combination. Resolution order when
            // more than one structure could apply to a student is
            // "most specific wins" — see InvoiceGenerationService.
            $table->foreignId('programme_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('level_id')->nullable()->constrained()->cascadeOnDelete();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['academic_session_id', 'programme_id', 'level_id', 'name'], 'unique_fee_structure_scope_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};
