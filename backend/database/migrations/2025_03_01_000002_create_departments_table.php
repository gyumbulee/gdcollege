<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            /**
             * The HOD's *institutional scope* (role_user.scope_type/scope_id
             * from Phase 1) is the source of truth for "who is HOD of this
             * department" — this column is a fast-lookup convenience only,
             * kept in sync by the application layer, not authoritative.
             */
            $table->foreignId('hod_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
