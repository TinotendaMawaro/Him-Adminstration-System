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
        Schema::table('home_groups', function (Blueprint $table) {
            $table->string('location')->nullable()->after('zone_id');
            $table->string('meeting_day')->nullable()->after('location');
            $table->time('meeting_time')->nullable()->after('meeting_day');
            $table->foreignId('leader_id')->nullable()->constrained('users')->onDelete('set null')->after('meeting_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('home_groups', function (Blueprint $table) {
            $table->dropForeign(['leader_id']);
            $table->dropColumn(['location', 'meeting_day', 'meeting_time', 'leader_id']);
        });
    }
};

