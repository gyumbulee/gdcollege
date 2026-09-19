<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            /** Dot-slugged, matching AuditLogger's action convention, e.g. 'admissions.decision', 'results.published', 'payments.confirmed'. */
            $table->string('type');
            $table->string('title');
            $table->text('body')->nullable();
            /** Frontend path the notification should link to, e.g. '/student/results'. */
            $table->string('link')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
