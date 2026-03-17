<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('type', [
                'conference',
                'forum',
                'seminar',
                'youth_camp',
                'retreat',
                'special_service',
                'fundraiser',
                'other',
            ])->default('special_service');

            // Scheduling
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();

            // Venue
            $table->string('venue_name')->nullable();
            $table->string('venue_address')->nullable();
            $table->foreignId('zone_id')->nullable()->constrained()->onDelete('set null');

            // Registration
            $table->boolean('requires_registration')->default(false);
            $table->boolean('requires_payment')->default(false);
            $table->decimal('registration_fee', 12, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->unsignedInteger('capacity')->nullable();
            $table->dateTime('registration_closes_at')->nullable();

            // Visibility / status
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])
                ->default('draft');
            $table->boolean('is_public')->default(true);

            // Ownership
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');

            $table->string('banner_image')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
