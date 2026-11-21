<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Every department gets its own private channel, run by its head of department; this links the two. */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('channels', 'department_id')) {
            Schema::table('channels', function (Blueprint $t) {
                $t->unsignedBigInteger('department_id')->nullable();
            });
        }
        try {
            Schema::table('channels', function (Blueprint $t) {
                $t->index('department_id', 'channels_department_id_index');
            });
        } catch (\Throwable) {
            // index already there
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('channels', 'department_id')) {
            Schema::table('channels', fn (Blueprint $t) => $t->dropColumn('department_id'));
        }
    }
};
