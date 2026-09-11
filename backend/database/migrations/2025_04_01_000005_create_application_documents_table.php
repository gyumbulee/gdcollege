<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            /** e.g. "olevel_result", "passport_photo", "birth_certificate" —
             *  the allowed set is configurable, see config/admissions.php. */
            $table->string('document_type');
            $table->string('original_filename');
            /** Path on a PRIVATE disk — never publicly browsable. Served
             *  only through an authenticated, ownership-checked route. */
            $table->string('storage_path');
            $table->unsignedInteger('size_bytes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_documents');
    }
};
