<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lets a Super Administrator / ICT Administrator (institution.manage)
 * upload a reference file per document type — e.g. a letterhead/receipt
 * layout to hand to Registry/Bursary, or a specimen of the College's
 * preferred format. This is intentionally a plain attachment, not a
 * template *engine*: DocumentIssuanceService still generates every
 * instant document from live data (§22 — never hand-entered), and the
 * uploaded file here is reference material, clearly labelled as demo
 * scope until a real templating/PDF pipeline is commissioned. See
 * Admin\DocumentTemplateController.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_templates', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('requires_request');
            $table->string('original_filename')->nullable()->after('file_path');
            $table->foreignId('uploaded_by')->nullable()->after('original_filename')->constrained('users')->nullOnDelete();
            $table->timestamp('uploaded_at')->nullable()->after('uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::table('document_templates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('uploaded_by');
            $table->dropColumn(['file_path', 'original_filename', 'uploaded_at']);
        });
    }
};
