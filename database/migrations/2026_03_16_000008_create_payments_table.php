<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Central payments table covering:
     * tithe, offering, family_altar, partnership, event_registration
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Optional links — a payment can belong to an event registration
            // or stand alone (tithe, offering, etc.)
            $table->foreignId('event_registration_id')
                ->nullable()
                ->constrained()
                ->onDelete('set null');

            $table->enum('type', [
                'tithe',
                'offering',
                'family_altar',
                'partnership',
                'event_registration',
                'other',
            ]);

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');

            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])
                ->default('pending');

            $table->enum('method', [
                'cash',
                'bank_transfer',
                'card',
                'mobile_money',
                'online',
            ])->nullable();

            $table->string('transaction_id')->nullable();  // gateway reference
            $table->text('notes')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Who recorded the payment (cashier/finance user)
            $table->foreignId('recorded_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'type']);
            $table->index(['event_registration_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
