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
        // Department join requests table
        Schema::create('department_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->foreignId('requested_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'department_id']);
        });

        // Home group members pivot table (for many-to-many relationship)
        Schema::create('home_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['member', 'leader'])->default('member');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['home_group_id', 'user_id']);
        });

        // Add home_group_id to users if not exists (alternative to pivot)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'home_group_id')) {
                $table->foreignId('home_group_id')->nullable()->constrained()->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('department_requests');
        Schema::dropIfExists('home_group_members');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['home_group_id']);
            $table->dropColumn(['home_group_id']);
        });
    }
};
