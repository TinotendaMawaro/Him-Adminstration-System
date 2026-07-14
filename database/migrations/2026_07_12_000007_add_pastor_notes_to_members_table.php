<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->text('pastor_notes')->nullable()->after('status');
            $table->foreignId('pastor_notes_by')->nullable()->constrained('users')->nullOnDelete()->after('pastor_notes');
            $table->timestamp('pastor_notes_updated_at')->nullable()->after('pastor_notes_by');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropForeign(['pastor_notes_by']);
            $table->dropColumn(['pastor_notes', 'pastor_notes_by', 'pastor_notes_updated_at']);
        });
    }
};
