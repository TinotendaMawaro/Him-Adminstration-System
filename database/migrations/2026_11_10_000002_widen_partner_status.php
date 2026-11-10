<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The partners.status column only allowed active / inactive / lapsed, but the application (PartnerStatus) has always had
 * pending, expired, suspended and cancelled as well: saving any of those failed with "Data truncated". This adds the missing
 * values (appending members to an ENUM is a metadata-only change on MySQL and TiDB) and folds the old "lapsed" into "expired".
 */
return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('partners') || DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE partners MODIFY status ENUM('active','inactive','lapsed','pending','expired','suspended','cancelled') NOT NULL DEFAULT 'active'");
        DB::table('partners')->where('status', 'lapsed')->update(['status' => 'expired']);
    }

    public function down(): void
    {
        // Intentionally left in place: narrowing the column again could truncate real data.
    }
};
