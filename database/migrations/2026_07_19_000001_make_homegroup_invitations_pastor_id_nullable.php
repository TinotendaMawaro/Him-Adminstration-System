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
        Schema::table('homegroup_invitations', function (Blueprint $table) {
            if (Schema::hasColumn('homegroup_invitations', 'pastor_id')) {
                $table->foreignId('pastor_id')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('homegroup_invitations', function (Blueprint $table) {
            if (Schema::hasColumn('homegroup_invitations', 'pastor_id')) {
                $table->foreignId('pastor_id')->change();
            }
        });
    }
};
