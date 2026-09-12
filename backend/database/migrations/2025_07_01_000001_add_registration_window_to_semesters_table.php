<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Per-semester registration window. Configurable per semester (not a
     * single global setting) since different semesters legitimately open
     * registration at different times.
     */
    public function up(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->timestamp('registration_opens_at')->nullable()->after('end_date');
            $table->timestamp('registration_closes_at')->nullable()->after('registration_opens_at');
        });
    }

    public function down(): void
    {
        Schema::table('semesters', function (Blueprint $table) {
            $table->dropColumn(['registration_opens_at', 'registration_closes_at']);
        });
    }
};
