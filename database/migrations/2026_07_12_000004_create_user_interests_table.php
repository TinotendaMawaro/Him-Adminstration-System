<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_interests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('interest_type');
            $table->string('interest_value');
            $table->integer('score')->default(1);
            $table->timestamp('last_triggered_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'interest_type', 'interest_value']);
            $table->index(['user_id', 'interest_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_interests');
    }
};
