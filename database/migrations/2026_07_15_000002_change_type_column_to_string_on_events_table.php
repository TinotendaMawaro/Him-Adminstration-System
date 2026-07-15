<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('type')->change();
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->enum('type', [
                'conference',
                'forum',
                'seminar',
                'youth_camp',
                'retreat',
                'special_service',
                'fundraiser',
                'other',
            ])->default('special_service')->change();
        });
    }
};
