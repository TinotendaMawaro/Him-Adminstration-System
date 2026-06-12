<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category');
            $table->string('condition');
            $table->decimal('value', 15, 2)->nullable();
            $table->foreignId('zone_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('assigned_to_partner_id')->nullable()->constrained('partners')->onDelete('set null');
            $table->string('status');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['zone_id', 'status']);
            $table->index('assigned_to_partner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
