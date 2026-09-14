<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issued_documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_number')->unique();
            // Short, unguessable code — this, not document_number, is
            // what /verify/{code} looks up (§22: "Do not expose private
            // files publicly" — the public page shows only what
            // toPublicArray() below chooses to reveal, never the full
            // content snapshot).
            $table->string('verification_code', 32)->unique();
            $table->string('type');
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_request_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('issued_at');
            /** ACTIVE, REVOKED — revocation, not deletion (§35). */
            $table->string('status')->default('ACTIVE');
            $table->text('revoked_reason')->nullable();
            // Structured snapshot of exactly what was true at issuance
            // time (student name/matric, programme, scores, amounts,
            // etc.) — never a live join back to current records, so a
            // later correction to a result/programme can never silently
            // rewrite a document that already left the institution's
            // hands. See DocumentIssuanceService.
            $table->json('content');
            $table->timestamps();

            $table->index(['student_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issued_documents');
    }
};
