<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zones', function (Blueprint $table) {
            $table->string('location')->nullable()->after('region_id');
            $table->integer('year_established')->nullable()->after('location');
            $table->text('description')->nullable()->after('year_established');
            $table->string('address')->nullable()->after('description');
            $table->string('phone')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('zones', function (Blueprint $table) {
            $table->dropColumn(['location', 'year_established', 'description', 'address', 'phone']);
        });
    }
};
