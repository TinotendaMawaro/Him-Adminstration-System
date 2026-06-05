<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('regions', function (Blueprint $table) {
            $table->string('code', 10)->nullable()->after('name');
            $table->unique('code');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->string('member_code', 50)->unique()->nullable()->after('member_number');
        });
    }

    public function down(): void
    {
        Schema::table('regions', function (Blueprint $table) {
            $table->dropColumn('code');
        });

        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('member_code');
        });
    }
};
