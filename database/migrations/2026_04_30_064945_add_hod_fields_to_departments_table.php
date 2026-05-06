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
        Schema::table('departments', function (Blueprint $table) {
            $table->foreignId('hod_id')->nullable()->constrained('users')->onDelete('set null')->after('description');
            $table->enum('hod_status', ['pending', 'accepted', 'declined', null])->nullable()->after('hod_id');
            $table->timestamp('hod_assigned_at')->nullable()->after('hod_status');
            $table->timestamp('hod_accepted_at')->nullable()->after('hod_assigned_at');
            $table->text('hod_notes')->nullable()->after('hod_accepted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['hod_id']);
            $table->dropColumn(['hod_id', 'hod_status', 'hod_assigned_at', 'hod_accepted_at', 'hod_notes']);
        });
    }
};
