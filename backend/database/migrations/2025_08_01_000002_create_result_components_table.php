<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Configurable assessment components — e.g. "CA" (max 30) and
     * "Examination" (max 70), but NOT hardcoded to exactly those two or
     * that split (§12: "Do not hardcode CA = 30 and Exam = 70"). An
     * institution could configure three components if it wants to.
     */
    public function up(): void
    {
        Schema::create('result_components', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedTinyInteger('max_score');
            $table->unsignedTinyInteger('sort_order')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('result_components');
    }
};
