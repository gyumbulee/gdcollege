<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_structure_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            // DECIMAL, not float — money is never stored as a binary float
            // anywhere in this schema (payments/invoices follow the same
            // convention) to avoid rounding drift.
            $table->decimal('amount', 12, 2);
            // §20: "Support mandatory fees, optional fees" — no percentage
            // split (30/70 CA/Exam-style) is invented here; amounts are
            // whatever the institution configures per item.
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_items');
    }
};
