<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A record of every message the master console sends to pastors (the individual notices live in `notifications`).
        Schema::create('broadcasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject', 150);
            $table->text('body');
            $table->string('audience_type', 20);          // all | regions | zones | pastors
            $table->json('audience')->nullable();         // the chosen ids
            $table->boolean('email_copy')->default(true);
            $table->unsignedInteger('recipients_count')->default(0);
            $table->timestamps();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('broadcasts');
    }
};
