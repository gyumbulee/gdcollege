<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            // Our own reference, generated before the gateway is ever
            // contacted — this is what §21 means by "payment references
            // must be unique": it's the idempotency key the webhook
            // handler looks up by, independent of whatever reference
            // format a given gateway uses.
            $table->string('reference')->unique();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('gateway'); // 'test' | 'paystack' | 'flutterwave' | 'korapay' — see PaymentGatewayManager
            $table->string('gateway_reference')->nullable();
            $table->decimal('amount', 12, 2);
            /** PENDING, SUCCESSFUL, FAILED, REFUNDED — §21: never SUCCESSFUL until server-side verification. */
            $table->string('status')->default('PENDING');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamps();

            $table->index(['gateway', 'gateway_reference']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
