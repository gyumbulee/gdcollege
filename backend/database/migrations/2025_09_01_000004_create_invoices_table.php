<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('semester_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('fee_structure_id')->nullable()->constrained()->nullOnDelete();
            /** PENDING, PARTIALLY_PAID, PAID, VOID — §20/§35 (voiding, not hard deletion). */
            $table->string('status')->default('PENDING');
            $table->decimal('total_amount', 12, 2)->default(0);
            // amount_paid/balance are denormalized running totals, updated
            // only inside PaymentVerificationService's DB transaction —
            // never written to directly elsewhere. Kept denormalized
            // (rather than always summing financial_transactions) so a
            // student's balance is a single indexed read, not an
            // aggregate query, on every invoice list/dashboard render.
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
