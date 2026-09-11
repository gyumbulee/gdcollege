<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            /**
             * Institutional scope for the role assignment — e.g. an HOD's
             * role_user row can be scoped to a single department_id once
             * departments exist (Phase 2). Null scope = institution-wide.
             */
            $table->string('scope_type')->nullable();
            $table->unsignedBigInteger('scope_id')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'role_id', 'scope_type', 'scope_id'], 'role_user_unique_assignment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_user');
    }
};
