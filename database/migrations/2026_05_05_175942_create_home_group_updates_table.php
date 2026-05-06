<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('home_group_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->enum('type', ['announcement', 'prayer_request', 'event', 'general'])->default('general');
            $table->boolean('is_pinned')->default(false);
            $table->timestamp('published_at')->useCurrent();
            $table->timestamps();

            $table->index(['home_group_id', 'published_at']);
            $table->index(['home_group_id', 'is_pinned']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_group_updates');
    }
};
