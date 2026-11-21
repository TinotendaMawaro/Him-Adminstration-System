<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Every home group gets its own private channel; this links the two. */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('channels', 'home_group_id')) {
            Schema::table('channels', function (Blueprint $t) {
                $t->unsignedBigInteger('home_group_id')->nullable();
            });
        }
        try {
            Schema::table('channels', function (Blueprint $t) {
                $t->index('home_group_id', 'channels_home_group_id_index');
            });
        } catch (\Throwable) {
            // index already there
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('channels', 'home_group_id')) {
            Schema::table('channels', fn (Blueprint $t) => $t->dropColumn('home_group_id'));
        }
    }
};
