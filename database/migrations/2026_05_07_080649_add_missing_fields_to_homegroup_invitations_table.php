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
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade')->after('pastor_id');
            $table->boolean('is_request')->default(false)->after('requested_by');
            $table->text('message')->nullable()->after('is_request');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('homegroup_invitations', function (Blueprint $table) {
            $table->dropForeign(['requested_by']);
            $table->dropColumn(['requested_by', 'is_request', 'message']);
        });
    }
};
