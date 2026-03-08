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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['pastor', 'member', 'partner', 'hod'])->default('member')->after('email');
            $table->string('unique_code')->unique()->nullable()->after('role');
            $table->foreignId('zone_id')->nullable()->constrained()->onDelete('set null')->after('unique_code');
            $table->foreignId('home_group_id')->nullable()->constrained()->onDelete('set null')->after('zone_id');
            $table->foreignId('department_id')->nullable()->constrained()->onDelete('set null')->after('home_group_id');
            $table->foreignId('gender_id')->nullable()->constrained()->onDelete('set null')->after('department_id');
            $table->foreignId('demography_id')->nullable()->constrained()->onDelete('set null')->after('gender_id');
            $table->string('phone')->nullable()->after('demography_id');
            $table->string('address')->nullable()->after('phone');
            $table->date('date_of_birth')->nullable()->after('address');
            $table->boolean('is_active')->default(true)->after('date_of_birth');
            $table->boolean('terms_accepted')->default(false)->after('is_active');
            $table->timestamp('terms_accepted_at')->nullable()->after('terms_accepted');
            $table->timestamp('first_login_at')->nullable()->after('terms_accepted_at');
            $table->boolean('completed_tour')->default(false)->after('first_login_at');
            $table->text('profile_photo')->nullable()->after('completed_tour');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role', 'unique_code', 'zone_id', 'home_group_id', 
                'department_id', 'gender_id', 'demography_id',
                'phone', 'address', 'date_of_birth', 'is_active',
                'terms_accepted', 'terms_accepted_at', 'first_login_at',
                'completed_tour', 'profile_photo'
            ]);
        });
    }
};
