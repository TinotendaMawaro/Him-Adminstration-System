<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('to_email');
            $table->string('subject');
            $table->string('template', 60);            // welcome, payment_receipt, notification, ...
            $table->string('category', 30)->default('transactional'); // transactional | notification
            // queued -> sent -> delivered | bounced | complained | delayed ; or failed | skipped
            $table->string('status', 20)->default('queued');
            $table->string('provider_id', 64)->nullable()->index();   // Resend email id
            $table->text('error')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['to_email']);
        });

        Schema::table('users', function (Blueprint $table) {
            // Optional emails (notification mirrors) can be switched off; transactional/security mail always sends.
            $table->boolean('email_notifications')->default(true);
            // Set automatically when an address hard-bounces or the person marks us as spam.
            $table->timestamp('email_suppressed_at')->nullable();
            $table->string('email_suppression_reason', 60)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_notifications', 'email_suppressed_at', 'email_suppression_reason']);
        });
        Schema::dropIfExists('email_logs');
    }
};
