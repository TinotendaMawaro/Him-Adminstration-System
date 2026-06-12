<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->onDelete('cascade');
            $table->string('tier');
            $table->string('benefit_key');
            $table->timestamp('unlocked_at')->nullable();
            $table->foreignId('unlocked_by_payment_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['partner_id', 'tier', 'benefit_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_benefits');
    }
};
