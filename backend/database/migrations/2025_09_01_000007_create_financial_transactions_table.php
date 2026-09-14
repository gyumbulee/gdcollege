<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            /** PAYMENT, REFUND, ADJUSTMENT, WAIVER, DISCOUNT, PENALTY — §20. */
            $table->string('type');
            /** CREDIT reduces what the student owes (payment/waiver/discount); DEBIT increases it (penalty/adjustment-up). */
            $table->string('direction');
            $table->decimal('amount', 12, 2);
            $table->text('description')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Append-only ledger: no updated-in-place edits are ever made
            // to a row here (see FinancialTransaction model) — a correction
            // is its own new ADJUSTMENT row, never a rewritten old one,
            // per §35 "institutional records should not be casually
            // hard-deleted" and §20 "all financial changes must be
            // auditable."
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
