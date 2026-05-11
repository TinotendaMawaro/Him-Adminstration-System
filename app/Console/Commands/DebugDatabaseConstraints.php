<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DebugDatabaseConstraints extends Command
{
    protected $signature = 'debug:constraints {--table= : Specific table to check}';
    protected $description = 'Debug database constraint violations and data integrity issues';

    public function handle()
    {
        $table = $this->option('table') ?: 'all';

        $this->info('🔍 Database Constraint Debugger');
        $this->info('================================');

        if ($table === 'all' || $table === 'members') {
            $this->checkMembersTable();
        }

        if ($table === 'all' || $table === 'homegroup_invitations') {
            $this->checkHomeGroupInvitationsTable();
        }

        if ($table === 'all' || $table === 'users') {
            $this->checkUsersTable();
        }

        $this->checkForeignKeyIntegrity();
        $this->checkUniqueConstraints();

        $this->info('✅ Constraint debugging completed');
    }

    private function checkMembersTable()
    {
        $this->info('📋 Checking members table...');

        // Check for orphaned members (no corresponding user)
        $orphanedMembers = DB::select("
            SELECT m.id, m.user_id, m.name, m.surname
            FROM members m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE u.id IS NULL
            LIMIT 10
        ");

        if (count($orphanedMembers) > 0) {
            $this->error("❌ Found " . count($orphanedMembers) . " orphaned member records:");
            foreach ($orphanedMembers as $member) {
                $this->line("  - Member ID {$member->id}: {$member->name} {$member->surname} (user_id: {$member->user_id})");
            }
        } else {
            $this->info('✅ No orphaned member records found');
        }

        // Check for duplicate user_id references
        $duplicateUsers = DB::select("
            SELECT user_id, COUNT(*) as count
            FROM members
            GROUP BY user_id
            HAVING count > 1
            LIMIT 10
        ");

        if (count($duplicateUsers) > 0) {
            $this->error("❌ Found " . count($duplicateUsers) . " users with multiple member records:");
            foreach ($duplicateUsers as $dup) {
                $this->line("  - User ID {$dup->user_id}: {$dup->count} member records");
            }
        } else {
            $this->info('✅ No duplicate user-member relationships found');
        }
    }

    private function checkHomeGroupInvitationsTable()
    {
        $this->info('📨 Checking homegroup_invitations table...');

        // Check for orphaned invitations (invalid homegroup_id)
        $orphanedHomeGroups = DB::select("
            SELECT i.id, i.homegroup_id, i.member_id
            FROM homegroup_invitations i
            LEFT JOIN home_groups h ON i.homegroup_id = h.id
            WHERE h.id IS NULL
            LIMIT 10
        ");

        if (count($orphanedHomeGroups) > 0) {
            $this->error("❌ Found " . count($orphanedHomeGroups) . " invitations with invalid homegroup_id:");
            foreach ($orphanedHomeGroups as $invitation) {
                $this->line("  - Invitation ID {$invitation->id}: homegroup_id {$invitation->homegroup_id}");
            }
        }

        // Check for orphaned invitations (invalid member_id)
        $orphanedMembers = DB::select("
            SELECT i.id, i.homegroup_id, i.member_id
            FROM homegroup_invitations i
            LEFT JOIN users u ON i.member_id = u.id
            WHERE u.id IS NULL
            LIMIT 10
        ");

        if (count($orphanedMembers) > 0) {
            $this->error("❌ Found " . count($orphanedMembers) . " invitations with invalid member_id:");
            foreach ($orphanedMembers as $invitation) {
                $this->line("  - Invitation ID {$invitation->id}: member_id {$invitation->member_id}");
            }
        }

        // Check unique constraint violations
        $duplicateInvitations = DB::select("
            SELECT homegroup_id, member_id, COUNT(*) as count
            FROM homegroup_invitations
            WHERE status = 'pending'
            GROUP BY homegroup_id, member_id
            HAVING count > 1
            LIMIT 10
        ");

        if (count($duplicateInvitations) > 0) {
            $this->error("❌ Found " . count($duplicateInvitations) . " duplicate pending invitations:");
            foreach ($duplicateInvitations as $dup) {
                $this->line("  - HomeGroup {$dup->homegroup_id}, Member {$dup->member_id}: {$dup->count} pending invitations");
            }
        } else {
            $this->info('✅ No duplicate pending invitations found');
        }
    }

    private function checkUsersTable()
    {
        $this->info('👤 Checking users table...');

        // Check for users without member records (for members only)
        $usersWithoutMembers = DB::select("
            SELECT u.id, u.name, u.email, u.role
            FROM users u
            LEFT JOIN members m ON u.id = m.user_id
            WHERE u.role = 'member' AND m.id IS NULL
            LIMIT 10
        ");

        if (count($usersWithoutMembers) > 0) {
            $this->error("❌ Found " . count($usersWithoutMembers) . " member users without member records:");
            foreach ($usersWithoutMembers as $user) {
                $this->line("  - User ID {$user->id}: {$user->name} ({$user->email})");
            }
        } else {
            $this->info('✅ All member users have corresponding member records');
        }
    }

    private function checkForeignKeyIntegrity()
    {
        $this->info('🔗 Checking foreign key integrity...');

        // Get all foreign key constraints
        $constraints = DB::select("
            SELECT
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND REFERENCED_TABLE_NAME IS NOT NULL
              AND TABLE_NAME IN ('members', 'homegroup_invitations', 'users')
        ");

        foreach ($constraints as $constraint) {
            $this->line("  - {$constraint->TABLE_NAME}.{$constraint->COLUMN_NAME} → {$constraint->REFERENCED_TABLE_NAME}.{$constraint->REFERENCED_COLUMN_NAME}");
        }

        // Check for constraint violations
        $violations = DB::select("
            SELECT 'members_zone_id' as check_type, COUNT(*) as violations
            FROM members m
            LEFT JOIN zones z ON m.zone_id = z.id
            WHERE m.zone_id IS NOT NULL AND z.id IS NULL

            UNION ALL

            SELECT 'members_home_group_id' as check_type, COUNT(*) as violations
            FROM members m
            LEFT JOIN home_groups h ON m.home_group_id = h.id
            WHERE m.home_group_id IS NOT NULL AND h.id IS NULL

            UNION ALL

            SELECT 'invitations_homegroup_id' as check_type, COUNT(*) as violations
            FROM homegroup_invitations i
            LEFT JOIN home_groups h ON i.homegroup_id = h.id
            WHERE h.id IS NULL
        ");

        $hasViolations = false;
        foreach ($violations as $violation) {
            if ($violation->violations > 0) {
                $this->error("❌ Foreign key violations in {$violation->check_type}: {$violation->violations} records");
                $hasViolations = true;
            }
        }

        if (!$hasViolations) {
            $this->info('✅ No foreign key constraint violations found');
        }
    }

    private function checkUniqueConstraints()
    {
        $this->info('🔒 Checking unique constraints...');

        // Check members unique constraints
        $duplicateMemberNumbers = DB::select("
            SELECT member_number, COUNT(*) as count
            FROM members
            WHERE member_number IS NOT NULL
            GROUP BY member_number
            HAVING count > 1
            LIMIT 5
        ");

        if (count($duplicateMemberNumbers) > 0) {
            $this->error("❌ Duplicate member numbers found:");
            foreach ($duplicateMemberNumbers as $dup) {
                $this->line("  - Member number '{$dup->member_number}': {$dup->count} occurrences");
            }
        }

        // Check user emails
        $duplicateEmails = DB::select("
            SELECT email, COUNT(*) as count
            FROM users
            GROUP BY email
            HAVING count > 1
            LIMIT 5
        ");

        if (count($duplicateEmails) > 0) {
            $this->error("❌ Duplicate email addresses found:");
            foreach ($duplicateEmails as $dup) {
                $this->line("  - Email '{$dup->email}': {$dup->count} occurrences");
            }
        }

        $this->info('✅ Unique constraint checks completed');
    }
}