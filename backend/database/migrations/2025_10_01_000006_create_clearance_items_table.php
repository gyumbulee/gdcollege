<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clearance_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clearance_request_id')->constrained()->cascadeOnDelete();
            /** DEPARTMENT, LIBRARY, BURSARY, REGISTRY, EXAMINATION — §23's fixed pipeline order. */
            $table->string('stage');
            /** PENDING, APPROVED, REJECTED. */
            $table->string('status')->default('PENDING');
            $table->text('remark')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->unique(['clearance_request_id', 'stage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clearance_items');
    }
};
