<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            // ADMISSION_LETTER, COURSE_REG_SLIP, RESULT_SLIP, PAYMENT_RECEIPT,
            // STATEMENT_OF_RESULT, TRANSCRIPT, CLEARANCE_CERTIFICATE, OTHER
            $table->string('type')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            // Whether staff/students can request or auto-generate this
            // document type at all — lets ICT disable a type before its
            // content is ready, rather than removing code.
            $table->boolean('is_active')->default(true);
            // Instant types (registration slip, result slip, receipt,
            // admission letter) are generated on demand from existing
            // records. Non-instant types (transcript, statement of
            // result, clearance certificate) require a DocumentRequest
            // staff process first — see DocumentIssuanceService.
            $table->boolean('requires_request')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_templates');
    }
};
