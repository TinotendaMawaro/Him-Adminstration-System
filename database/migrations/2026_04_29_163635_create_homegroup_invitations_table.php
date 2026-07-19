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
          Schema::create('homegroup_invitations', function (Blueprint $table) {
              $table->id();
              $table->foreignId('homegroup_id')->constrained('home_groups')->onDelete('cascade');
              $table->foreignId('member_id')->constrained('users')->onDelete('cascade');
              $table->foreignId('pastor_id')->nullable()->constrained('users')->onDelete('cascade');
              $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
              $table->boolean('is_request')->default(false);
              $table->text('message')->nullable();
              $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
              $table->timestamp('invited_at')->useCurrent();
              $table->timestamp('responded_at')->nullable();
              $table->text('response_note')->nullable();
              $table->timestamps();

              $table->unique(['homegroup_id', 'member_id']);
          });
     }

     public function down(): void
     {
         Schema::dropIfExists('homegroup_invitations');
     }
};
