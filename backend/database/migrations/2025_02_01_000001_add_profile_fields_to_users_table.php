<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds the fields the platform needs beyond Laravel's default users
     * table. Kept as a separate migration (rather than editing the
     * skeleton's own create_users_table migration) so merging this phase
     * into a freshly generated Laravel app never clobbers framework files.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table
                ->enum('status', ['active', 'suspended', 'inactive'])
                ->default('active')
                ->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'status']);
        });
    }
};
