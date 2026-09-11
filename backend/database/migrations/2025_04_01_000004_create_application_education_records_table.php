<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** One row per O'Level sitting (a candidate may combine two sittings). */
    public function up(): void
    {
        Schema::create('application_education_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            /** e.g. "WAEC", "NECO", "NABTEB" — free text, not an enum, since
             *  the institution may accept boards not enumerated up front. */
            $table->string('exam_body');
            $table->string('exam_number')->nullable();
            $table->unsignedSmallInteger('exam_year');
            $table->string('school_attended')->nullable();
            /** [{ "subject": "English Language", "grade": "B2" }, ...] */
            $table->json('subjects');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_education_records');
    }
};
