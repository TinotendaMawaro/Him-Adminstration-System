<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');

            $table->string('name');
            $table->string('surname');
            $table->string('member_number')->unique()->nullable(); // auto-generated

            // Church placement
            $table->foreignId('zone_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('home_group_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null');

            // Personal
            $table->foreignId('gender_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('demography_id')->nullable()->constrained()->onDelete('set null');
            $table->date('date_of_birth')->nullable();
            $table->date('membership_date')->nullable();

            // Status
            $table->enum('status', ['active', 'inactive', 'transferred', 'deceased'])
                ->default('active');

            $table->boolean('is_baptised')->default(false);
            $table->boolean('can_be_partner')->default(true);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
