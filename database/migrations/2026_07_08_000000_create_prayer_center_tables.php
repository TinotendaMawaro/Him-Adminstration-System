<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prayer_center_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->string('description')->nullable();
            $table->string('color')->default('#D4AF37');
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('prayer_center_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('prayer_center_categories');
            $table->string('subject');
            $table->text('message');
            $table->text('message_original')->nullable();
            $table->string('status')->default('pending');
            $table->string('priority')->default('normal');
            $table->text('moderation_notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('prayer_center_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained('prayer_center_messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained();
            $table->text('reply');
            $table->string('type')->default('pastor_reply');
            $table->boolean('is_internal')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['message_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prayer_center_replies');
        Schema::dropIfExists('prayer_center_messages');
        Schema::dropIfExists('prayer_center_categories');
    }
};
