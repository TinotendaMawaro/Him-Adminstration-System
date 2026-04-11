<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pastors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            $table->string('name')->nullable();
            $table->string('surname');
            $table->string('code')->unique();

            // Structural placement
            $table->foreignId('zone_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('region_id')->nullable()->constrained()->onDelete('set null');

            // Ministry details
            $table->date('ordained_date')->nullable();
            $table->string('title')->default('Pastor');
            $table->boolean('is_zone_pastor')->default(false);
            $table->boolean('is_regional_leader')->default(false);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pastors');
    }
};
