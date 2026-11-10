<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One column per statement (TiDB cannot add several columns with AFTER clauses in one ALTER).
return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('pastors', 'is_zone_admin')) {
            Schema::table('pastors', function (Blueprint $t) {
                $t->boolean('is_zone_admin')->default(false);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('pastors', 'is_zone_admin')) {
            Schema::table('pastors', function (Blueprint $t) {
                $t->dropColumn('is_zone_admin');
            });
        }
    }
};
