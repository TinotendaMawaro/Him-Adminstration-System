<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->date('next_tier_reminder_at')->nullable()->after('tier_updated_at');
            $table->timestamp('last_benefit_unlock_at')->nullable()->after('next_tier_reminder_at');
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn(['last_benefit_unlock_at', 'next_tier_reminder_at']);
        });
    }
};
