<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /** A person can archive a notification (kept, but out of the way). One column per change: TiDB cannot add several at once. */
    public function up(): void
    {
        if (!Schema::hasColumn('notifications', 'archived_at')) {
            Schema::table('notifications', fn (Blueprint $t) => $t->timestamp('archived_at')->nullable());
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('notifications', 'archived_at')) {
            Schema::table('notifications', fn (Blueprint $t) => $t->dropColumn('archived_at'));
        }
    }
};
