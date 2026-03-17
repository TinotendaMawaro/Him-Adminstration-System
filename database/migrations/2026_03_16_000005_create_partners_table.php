<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Partners can optionally also be Members.
     * member_id is nullable because a Partner may not be a Member.
     */
    public function up(): void
    {
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('member_id')->nullable()->constrained()->onDelete('set null');

            $table->string('name');
            $table->string('surname');
            $table->string('partner_number')->unique()->nullable();

            // Partnership tier: bronze, silver, gold, platinum, founder
            $table->enum('tier', ['gold', 'platinum', 'jubilee', 'game_changer', 'diamond', 'executive', 'financial_apostle' ])
                ->default('gold');

            // Commitment
            $table->decimal('pledge_amount', 12, 2)->nullable();
            $table->enum('pledge_frequency', ['weekly', 'monthly', 'quarterly', 'annually'])
                ->nullable();

            $table->date('partnership_date')->nullable();
            $table->date('tier_updated_at')->nullable();

            $table->enum('status', ['active', 'inactive', 'lapsed'])->default('active');

            $table->foreignId('zone_id')->nullable()->constrained()->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partners');
    }
};
