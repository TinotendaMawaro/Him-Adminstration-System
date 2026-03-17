<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Physical address
            $table->string('street_address')->nullable();
            $table->string('suburb')->nullable();
            $table->string('city')->nullable();
            $table->foreignId('country_id')->nullable()->constrained()->onDelete('set null');
            $table->string('postal_code')->nullable();

            // Contact info
            $table->string('phone_primary')->nullable();
            $table->string('phone_secondary')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email_secondary')->nullable();

            // Social / emergency
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->string('emergency_contact_relation')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
