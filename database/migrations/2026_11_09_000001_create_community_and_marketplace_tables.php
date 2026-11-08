<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The community (feed, short videos, stories, polls, follows), channels (discussion, goals, meetings, live),
 * the official teachings library, and the partners-only marketplace. Everything hangs off the existing `users` table,
 * so a member signs in once and has one identity across the whole system.
 *
 * Counters (likes_count, comments_count...) are denormalised on purpose: the feed reads them on every card.
 * Only CREATE TABLE statements are used so the migration also runs on TiDB.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── People ────────────────────────────────────────────────────────────────────────
        Schema::create('community_profiles', function (Blueprint $t) {
            $t->unsignedBigInteger('user_id')->primary();
            $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $t->string('handle', 30)->unique();
            $t->string('bio', 280)->nullable();
            $t->string('website', 190)->nullable();
            $t->string('cover_url', 500)->nullable();
            $t->boolean('is_verified')->default(false);
            $t->timestamp('banned_until')->nullable();
            $t->timestamp('muted_until')->nullable();
            $t->string('moderation_note', 190)->nullable();
            $t->unsignedInteger('followers_count')->default(0);
            $t->unsignedInteger('following_count')->default(0);
            $t->unsignedInteger('posts_count')->default(0);
            $t->timestamps();
        });

        Schema::create('community_follows', function (Blueprint $t) {
            $t->id();
            $t->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('followed_id')->constrained('users')->cascadeOnDelete();
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['follower_id', 'followed_id']);
            $t->index('followed_id');
        });

        Schema::create('community_blocks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('blocker_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('blocked_id')->constrained('users')->cascadeOnDelete();
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['blocker_id', 'blocked_id']);
        });

        // ── Channels ──────────────────────────────────────────────────────────────────────
        Schema::create('channels', function (Blueprint $t) {
            $t->id();
            $t->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $t->string('name', 80);
            $t->string('slug', 100)->unique();
            $t->text('description')->nullable();
            $t->string('avatar_url', 500)->nullable();
            $t->string('cover_url', 500)->nullable();
            $t->string('category', 40)->nullable();
            $t->boolean('is_private')->default(false);
            $t->boolean('is_official')->default(false);
            $t->string('status', 12)->default('active');          // active | suspended
            $t->unsignedInteger('members_count')->default(0);
            $t->timestamps();
            $t->softDeletes();
            $t->index(['status', 'is_private']);
        });

        Schema::create('channel_members', function (Blueprint $t) {
            $t->id();
            $t->foreignId('channel_id')->constrained('channels')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('role', 12)->default('member');            // owner | moderator | member
            $t->string('status', 12)->default('active');          // active | pending | banned
            $t->timestamp('joined_at')->nullable();
            $t->timestamps();
            $t->unique(['channel_id', 'user_id']);
            $t->index('user_id');
        });

        // ── Posts, comments, reactions ────────────────────────────────────────────────────
        Schema::create('community_posts', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('channel_id')->nullable()->constrained('channels')->nullOnDelete();
            $t->unsignedBigInteger('repost_of_id')->nullable();
            $t->string('kind', 12)->default('text');              // text | image | video | short | poll | announcement
            $t->text('body')->nullable();
            $t->json('media')->nullable();                        // [{type:image|video, url, provider, video_id, thumb}]
            $t->json('poll')->nullable();                         // {options:[..], closes_at}
            $t->unsignedInteger('likes_count')->default(0);
            $t->unsignedInteger('comments_count')->default(0);
            $t->unsignedInteger('reposts_count')->default(0);
            $t->unsignedInteger('views_count')->default(0);
            $t->boolean('is_pinned')->default(false);
            $t->string('status', 12)->default('published');       // published | hidden | removed
            $t->timestamps();
            $t->softDeletes();
            $t->index(['status', 'created_at']);
            $t->index(['user_id', 'created_at']);
            $t->index(['channel_id', 'created_at']);
            $t->index(['kind', 'status', 'created_at']);
            $t->index('repost_of_id');
        });

        Schema::create('community_comments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('post_id')->constrained('community_posts')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->unsignedBigInteger('parent_id')->nullable();
            $t->text('body');
            $t->unsignedInteger('likes_count')->default(0);
            $t->string('status', 12)->default('published');
            $t->timestamps();
            $t->softDeletes();
            $t->index(['post_id', 'created_at']);
            $t->index('parent_id');
        });

        Schema::create('community_likes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('likeable_type', 10);                      // post | comment
            $t->unsignedBigInteger('likeable_id');
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['user_id', 'likeable_type', 'likeable_id'], 'community_likes_unique');
            $t->index(['likeable_type', 'likeable_id']);
        });

        Schema::create('community_bookmarks', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('post_id')->constrained('community_posts')->cascadeOnDelete();
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['user_id', 'post_id']);
        });

        Schema::create('community_hashtags', function (Blueprint $t) {
            $t->id();
            $t->string('tag', 60)->unique();
            $t->unsignedInteger('uses_count')->default(0);
            $t->timestamp('last_used_at')->nullable();
        });

        Schema::create('community_post_hashtag', function (Blueprint $t) {
            $t->id();
            $t->foreignId('post_id')->constrained('community_posts')->cascadeOnDelete();
            $t->foreignId('hashtag_id')->constrained('community_hashtags')->cascadeOnDelete();
            $t->unique(['post_id', 'hashtag_id']);
            $t->index('hashtag_id');
        });

        Schema::create('community_poll_votes', function (Blueprint $t) {
            $t->id();
            $t->foreignId('post_id')->constrained('community_posts')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->unsignedTinyInteger('option_index');
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['post_id', 'user_id']);
        });

        // ── Stories (24 hours) ────────────────────────────────────────────────────────────
        Schema::create('community_stories', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('kind', 8)->default('image');              // image | video | text
            $t->string('media_url', 500)->nullable();
            $t->string('caption', 220)->nullable();
            $t->string('background', 20)->nullable();             // colour for text stories
            $t->unsignedInteger('views_count')->default(0);
            $t->timestamp('expires_at');
            $t->timestamps();
            $t->index(['expires_at', 'user_id']);
        });

        Schema::create('community_story_views', function (Blueprint $t) {
            $t->id();
            $t->foreignId('story_id')->constrained('community_stories')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['story_id', 'user_id']);
        });

        // ── Moderation ────────────────────────────────────────────────────────────────────
        Schema::create('community_reports', function (Blueprint $t) {
            $t->id();
            $t->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $t->string('subject_type', 12);                       // post | comment | channel | user | listing
            $t->unsignedBigInteger('subject_id');
            $t->string('reason', 40);
            $t->text('details')->nullable();
            $t->string('status', 12)->default('open');            // open | actioned | dismissed
            $t->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('handled_at')->nullable();
            $t->timestamps();
            $t->unique(['reporter_id', 'subject_type', 'subject_id'], 'community_reports_once');
            $t->index(['status', 'created_at']);
        });

        // ── Channel goals, meetings, chat ─────────────────────────────────────────────────
        Schema::create('channel_goals', function (Blueprint $t) {
            $t->id();
            $t->foreignId('channel_id')->constrained('channels')->cascadeOnDelete();
            $t->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $t->string('title', 140);
            $t->text('description')->nullable();
            $t->date('target_date')->nullable();
            $t->unsignedTinyInteger('progress')->default(0);
            $t->string('status', 10)->default('open');            // open | achieved | dropped
            $t->timestamps();
            $t->index(['channel_id', 'status']);
        });

        Schema::create('channel_goal_updates', function (Blueprint $t) {
            $t->id();
            $t->foreignId('goal_id')->constrained('channel_goals')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('note', 280)->nullable();
            $t->unsignedTinyInteger('progress');
            $t->timestamp('created_at')->useCurrent();
        });

        Schema::create('channel_meetings', function (Blueprint $t) {
            $t->id();
            $t->foreignId('channel_id')->constrained('channels')->cascadeOnDelete();
            $t->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $t->string('title', 140);
            $t->text('description')->nullable();
            $t->dateTime('starts_at');
            $t->dateTime('ends_at')->nullable();
            $t->string('mode', 10)->default('online');            // online | in_person
            $t->string('link_url', 500)->nullable();
            $t->string('location', 190)->nullable();
            $t->string('status', 10)->default('scheduled');       // scheduled | cancelled | done
            $t->boolean('reminder_sent')->default(false);
            $t->timestamps();
            $t->index(['channel_id', 'starts_at']);
        });

        Schema::create('channel_meeting_rsvps', function (Blueprint $t) {
            $t->id();
            $t->foreignId('meeting_id')->constrained('channel_meetings')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('status', 10)->default('going');           // going | maybe | declined
            $t->timestamps();
            $t->unique(['meeting_id', 'user_id']);
        });

        Schema::create('channel_messages', function (Blueprint $t) {
            $t->id();
            $t->foreignId('channel_id')->constrained('channels')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->string('body', 1000);
            $t->timestamp('created_at')->useCurrent();
            $t->index(['channel_id', 'id']);
        });

        // ── Official teachings + live sessions ────────────────────────────────────────────
        Schema::create('community_teachings', function (Blueprint $t) {
            $t->id();
            $t->string('title', 160);
            $t->text('description')->nullable();
            $t->string('youtube_url', 300);
            $t->string('video_id', 20);
            $t->string('thumbnail_url', 300)->nullable();
            $t->string('series', 80)->nullable();
            $t->string('speaker', 80)->default('Apostle Tavonga Vutabwashe');
            $t->boolean('is_featured')->default(false);
            $t->string('status', 10)->default('published');       // published | draft
            $t->unsignedInteger('views_count')->default(0);
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('published_at')->nullable();
            $t->timestamps();
            $t->index(['status', 'published_at']);
        });

        Schema::create('community_live_sessions', function (Blueprint $t) {
            $t->id();
            $t->foreignId('channel_id')->nullable()->constrained('channels')->nullOnDelete();
            $t->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $t->string('title', 160);
            $t->text('description')->nullable();
            $t->string('url', 300);
            $t->string('video_id', 20);
            $t->dateTime('scheduled_at');
            $t->string('status', 10)->default('scheduled');       // scheduled | live | ended | cancelled
            $t->boolean('is_official')->default(false);
            $t->boolean('reminder_sent')->default(false);
            $t->unsignedInteger('reminders_count')->default(0);
            $t->timestamps();
            $t->index(['status', 'scheduled_at']);
        });

        Schema::create('community_live_reminders', function (Blueprint $t) {
            $t->id();
            $t->foreignId('session_id')->constrained('community_live_sessions')->cascadeOnDelete();
            $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $t->timestamp('created_at')->useCurrent();
            $t->unique(['session_id', 'user_id']);
        });

        // ── Marketplace (partners sell; every member can buy or ask for a quote) ──────────
        Schema::create('market_listings', function (Blueprint $t) {
            $t->id();
            $t->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $t->string('title', 120);
            $t->text('description');
            $t->string('category', 40);
            $t->decimal('price', 12, 2)->nullable();
            $t->char('currency', 3)->default('USD');
            $t->string('price_type', 8)->default('fixed');        // fixed | quote
            $t->unsignedInteger('stock')->nullable();             // null = not tracked
            $t->json('images')->nullable();
            $t->string('location', 120)->nullable();
            $t->string('status', 12)->default('active');          // active | sold_out | paused | suspended
            $t->unsignedInteger('views_count')->default(0);
            $t->unsignedInteger('orders_count')->default(0);
            $t->timestamps();
            $t->softDeletes();
            $t->index(['status', 'category', 'created_at']);
            $t->index('seller_id');
        });

        Schema::create('market_orders', function (Blueprint $t) {
            $t->id();
            $t->string('reference', 20)->unique();
            $t->foreignId('listing_id')->constrained('market_listings')->cascadeOnDelete();
            $t->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $t->unsignedInteger('quantity')->default(1);
            $t->decimal('unit_price', 12, 2);
            $t->decimal('total', 12, 2);
            $t->char('currency', 3)->default('USD');
            $t->string('status', 12)->default('pending');         // pending | accepted | rejected | paid | shipped | completed | cancelled
            $t->string('buyer_note', 500)->nullable();
            $t->string('seller_note', 500)->nullable();
            $t->string('contact_phone', 30)->nullable();
            $t->string('delivery_address', 300)->nullable();
            $t->timestamps();
            $t->index(['buyer_id', 'status']);
            $t->index(['seller_id', 'status']);
        });

        Schema::create('market_quotes', function (Blueprint $t) {
            $t->id();
            $t->string('reference', 20)->unique();
            $t->foreignId('listing_id')->constrained('market_listings')->cascadeOnDelete();
            $t->foreignId('buyer_id')->constrained('users')->cascadeOnDelete();
            $t->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $t->unsignedInteger('quantity')->default(1);
            $t->text('message');
            $t->string('status', 12)->default('requested');       // requested | quoted | accepted | declined | cancelled
            $t->decimal('quoted_price', 12, 2)->nullable();
            $t->string('seller_reply', 500)->nullable();
            $t->date('valid_until')->nullable();
            $t->timestamps();
            $t->index(['buyer_id', 'status']);
            $t->index(['seller_id', 'status']);
        });
    }

    public function down(): void
    {
        foreach ([
            'market_quotes', 'market_orders', 'market_listings', 'community_live_reminders', 'community_live_sessions', 'community_teachings',
            'channel_messages', 'channel_meeting_rsvps', 'channel_meetings', 'channel_goal_updates', 'channel_goals', 'community_reports',
            'community_story_views', 'community_stories', 'community_poll_votes', 'community_post_hashtag', 'community_hashtags',
            'community_bookmarks', 'community_likes', 'community_comments', 'community_posts', 'channel_members', 'channels',
            'community_blocks', 'community_follows', 'community_profiles',
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
