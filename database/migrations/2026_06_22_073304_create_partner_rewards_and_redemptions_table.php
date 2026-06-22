<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_rewards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category'); // conference_discount, book, merchandise, event
            $table->integer('points_required');
            $table->decimal('monetary_value', 12, 2)->nullable();
            $table->string('image')->nullable();
            $table->integer('stock')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('partner_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->onDelete('cascade');
            $table->foreignId('reward_id')->constrained('partner_rewards')->onDelete('cascade');
            $table->foreignId('points_transaction_id')->nullable()->constrained('partner_points')->onDelete('set null');
            $table->integer('points_used');
            $table->string('status')->default('pending'); // pending, approved, fulfilled, cancelled
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['partner_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_redemptions');
        Schema::dropIfExists('partner_rewards');
    }
};
