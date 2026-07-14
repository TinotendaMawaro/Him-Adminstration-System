<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('badge_catalogs', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('description');
            $table->string('icon');
            $table->string('tier');
            $table->string('color');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('badge_catalog_id')->constrained()->cascadeOnDelete();
            $table->timestamp('earned_at');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'badge_catalog_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('badge_catalogs');
    }
};
