<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spiritual_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();

            $table->string('milestone_type');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->default('#d4af37');
            $table->json('metadata')->nullable();
            $table->timestamp('achieved_at');
            $table->timestamps();

            $table->index(['user_id', 'milestone_type', 'achieved_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spiritual_milestones');
    }
};
