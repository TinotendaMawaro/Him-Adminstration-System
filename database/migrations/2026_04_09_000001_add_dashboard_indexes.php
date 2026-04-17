<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $indexes = [
            ['zones', 'region_id', 'idx_zones_region_id'],
            ['home_groups', 'zone_id', 'idx_home_groups_zone_id'],
            ['home_groups', 'leader_id', 'idx_home_groups_leader_id'],
            ['departments', 'zone_id', 'idx_departments_zone_id'],
            ['members', 'zone_id', 'idx_members_zone_id'],
            ['members', 'status', 'idx_members_status'],
            ['members', 'membership_date', 'idx_members_membership_date'],
            ['members', 'home_group_id', 'idx_members_home_group_id'],
            ['members', 'gender_id', 'idx_members_gender_id'],
            ['reports', 'zone_id', 'idx_reports_zone_id'],
            ['reports', 'report_date', 'idx_reports_report_date'],
            ['events', 'zone_id', 'idx_events_zone_id'],
            ['events', 'starts_at', 'idx_events_starts_at'],
            ['events', 'status', 'idx_events_status'],
            ['pastors', 'zone_id', 'idx_pastors_zone_id'],
            ['users', 'zone_id', 'idx_users_zone_id'],
            ['users', 'role', 'idx_users_role'],
            ['users', 'is_active', 'idx_users_is_active'],
            ['partners', 'zone_id', 'idx_partners_zone_id'],
            ['partners', 'status', 'idx_partners_status'],
        ];

        foreach ($indexes as [$table, $column, $indexName]) {
            DB::statement("CREATE INDEX IF NOT EXISTS `$indexName` ON `$table`(`$column`)");
        }
    }

    public function down(): void
    {
        $indexes = [
            'idx_zones_region_id',
            'idx_home_groups_zone_id',
            'idx_home_groups_leader_id',
            'idx_departments_zone_id',
            'idx_members_zone_id',
            'idx_members_status',
            'idx_members_membership_date',
            'idx_members_home_group_id',
            'idx_members_gender_id',
            'idx_reports_zone_id',
            'idx_reports_report_date',
            'idx_events_zone_id',
            'idx_events_starts_at',
            'idx_events_status',
            'idx_pastors_zone_id',
            'idx_users_zone_id',
            'idx_users_role',
            'idx_users_is_active',
            'idx_partners_zone_id',
            'idx_partners_status',
        ];

        foreach ($indexes as $indexName) {
            DB::statement("DROP INDEX IF EXISTS `$indexName`");
        }
    }
};