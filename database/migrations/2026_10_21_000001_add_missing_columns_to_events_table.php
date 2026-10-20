<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (!Schema::hasColumn('events', 'host')) {
                $table->string('host')->nullable();
            }
            if (!Schema::hasColumn('events', 'theme')) {
                $table->string('theme')->nullable();
            }
            if (!Schema::hasColumn('events', 'is_featured')) {
                $table->boolean('is_featured')->default(false);
            }
            if (!Schema::hasColumn('events', 'is_livestream')) {
                $table->boolean('is_livestream')->default(false);
            }
            if (!Schema::hasColumn('events', 'livestream_url')) {
                $table->string('livestream_url', 500)->nullable();
            }
            if (!Schema::hasColumn('events', 'target_demographics')) {
                $table->json('target_demographics')->nullable();
            }
            if (!Schema::hasColumn('events', 'requires_checkin')) {
                $table->boolean('requires_checkin')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            foreach (['host', 'theme', 'is_featured', 'is_livestream', 'livestream_url', 'target_demographics', 'requires_checkin'] as $column) {
                if (Schema::hasColumn('events', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
