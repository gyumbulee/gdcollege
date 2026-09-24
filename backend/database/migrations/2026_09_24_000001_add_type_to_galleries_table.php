<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Distinguishes the ordinary public-facing Gallery albums (§7/§27,
     * `/gallery`) from a single admin-curated "Homepage Carousel" gallery
     * that feeds the homepage's featured carousel and is deliberately
     * excluded from the public gallery listing. Enforced to be singular
     * at the application layer in GalleryController (a nullable unique
     * index can't express "at most one row where type = FEATURED" in a
     * database-portable way), not here.
     */
    public function up(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->string('type')->default('STANDARD')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('galleries', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
