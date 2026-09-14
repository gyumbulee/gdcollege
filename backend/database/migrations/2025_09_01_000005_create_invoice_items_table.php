<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            // Nullable + name/amount snapshotted (not just a fee_item_id
            // reference): if a fee item is later edited or deactivated,
            // an already-issued invoice must keep showing what the
            // student was actually charged at the time — never a
            // silently-changed historical amount.
            $table->foreignId('fee_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->decimal('amount', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('waived_amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
