<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Payments were originally invoice+student only (Phase 10, built before
 * applicants had anything to pay). An application fee payment has no
 * invoice and no student yet — the applicant isn't a student until
 * admitted and converted (§7 of the Admissions module). This makes a
 * Payment polymorphic across exactly one of {invoice, application}:
 * PaymentVerificationService::verifyAndApply() branches on whichever
 * foreign key is actually set (applyToInvoice / applyToApplication).
 * Every other guarantee — idempotent webhook, server-side-only
 * verification, append-only financial_transactions ledger — is
 * unchanged; see that service.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('application_id')->nullable()->after('student_id')->constrained()->cascadeOnDelete();
        });

        // Blueprint::nullable()->change() needs doctrine/dbal, which this
        // project doesn't depend on elsewhere — a plain MySQL MODIFY does
        // the same thing without adding that dependency (this platform is
        // MySQL-only, per the architecture brief).
        DB::statement('ALTER TABLE payments MODIFY invoice_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE payments MODIFY student_id BIGINT UNSIGNED NULL');
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('application_id');
        });

        // Not reversed: NOT NULL would fail if any application-fee
        // payment rows exist. Rolling back this migration only makes
        // sense before that feature has ever been used.
    }
};
