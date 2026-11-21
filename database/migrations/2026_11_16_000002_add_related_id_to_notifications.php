<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /** For a message notification: the person who sent it, so a tap opens that conversation in the inbox. */
    public function up(): void
    {
        if (!Schema::hasColumn('notifications', 'related_id')) {
            Schema::table('notifications', fn (Blueprint $t) => $t->unsignedBigInteger('related_id')->nullable());
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('notifications', 'related_id')) {
            Schema::table('notifications', fn (Blueprint $t) => $t->dropColumn('related_id'));
        }
    }
};
