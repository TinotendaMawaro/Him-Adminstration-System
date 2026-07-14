<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sermon_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('sermon_id');
            $table->string('category')->nullable();
            $table->integer('watch_percentage')->default(0);
            $table->timestamp('watched_at');
            $table->timestamps();

            $table->unique(['user_id', 'sermon_id']);
            $table->index(['user_id', 'watched_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sermon_views');
    }
};
