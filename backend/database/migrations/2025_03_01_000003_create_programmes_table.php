<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programmes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            /** e.g. "ND" — kept as free text rather than an enum so the
             *  institution isn't locked into ND-only awards forever. */
            $table->string('award_type')->default('ND');
            /** How many levels this programme runs across, e.g. 2 for ND I–II. */
            $table->unsignedTinyInteger('duration_levels')->default(2);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programmes');
    }
};
