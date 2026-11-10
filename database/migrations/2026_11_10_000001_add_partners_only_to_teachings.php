<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One column per statement: TiDB (production) cannot add several columns with AFTER clauses in one ALTER.
return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('community_teachings', 'partners_only')) {
            Schema::table('community_teachings', function (Blueprint $t) {
                $t->boolean('partners_only')->default(false);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('community_teachings', 'partners_only')) {
            Schema::table('community_teachings', function (Blueprint $t) {
                $t->dropColumn('partners_only');
            });
        }
    }
};
