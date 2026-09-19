<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            /** ALL, STUDENTS, STAFF, SCHOOL, DEPARTMENT, PROGRAMME, LEVEL — §26. */
            $table->string('audience_type')->default('ALL');
            /** Only meaningful when audience_type is SCHOOL/DEPARTMENT/PROGRAMME/LEVEL — the matching row's id in that table. No FK constraint since it points at one of four different tables depending on audience_type. */
            $table->unsignedBigInteger('audience_id')->nullable();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('publish_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            /** DRAFT, PUBLISHED, ARCHIVED. */
            $table->string('status')->default('DRAFT');
            $table->timestamps();

            $table->index(['status', 'publish_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
