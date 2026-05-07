<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // The user being acted upon
            $table->string('action'); // hod_appointment, department_invitation, etc.
            $table->unsignedBigInteger('actor_id')->nullable(); // The admin/pastor performing the action
            $table->json('details')->nullable(); // Structured data about the action
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'action']);
            $table->index(['actor_id']);
            $table->index(['created_at']);

            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('actor_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
