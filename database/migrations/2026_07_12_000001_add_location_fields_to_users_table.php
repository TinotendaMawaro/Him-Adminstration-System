<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('address_line_1')->nullable()->after('phone');
            $table->string('address_line_2')->nullable()->after('address_line_1');
            $table->string('city')->nullable()->after('address_line_2');
            $table->string('province')->nullable()->after('city');
            $table->string('country')->nullable()->after('province');
            $table->string('postal_code')->nullable()->after('country');
            $table->decimal('latitude', 10, 7)->nullable()->after('postal_code');
            $table->decimal('longitude', 11, 7)->nullable()->after('latitude');
            $table->boolean('location_captured')->default(false)->after('longitude');
            $table->timestamp('location_captured_at')->nullable()->after('location_captured');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'address_line_1', 'address_line_2', 'city', 'province', 'country',
                'postal_code', 'latitude', 'longitude', 'location_captured', 'location_captured_at',
            ]);
        });
    }
};
