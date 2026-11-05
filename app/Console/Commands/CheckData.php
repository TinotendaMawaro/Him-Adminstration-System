<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Finds (and with --fix repairs) places where the same fact is stored twice and the copies disagree, or where a
 * record points at something that no longer exists. Stats, ID cards, finance roll-ups and every portal read these
 * columns, so they have to agree.
 *
 *   php artisan him:check-data          report only
 *   php artisan him:check-data --fix    repair what can be repaired safely (each repair is audited)
 */
class CheckData extends Command
{
    protected $signature = 'him:check-data {--fix : Repair the problems that have one obviously right answer}';
    protected $description = 'Check that people, zones, departments, payments and pastors are mapped consistently';

    private int $problems = 0;
    private int $repaired = 0;

    public function handle(): int
    {
        $fix = (bool) $this->option('fix');

        // ── Who is in which zone: the member / pastor record is the source of truth for the login account ──
        $this->check('Member accounts in a different zone than their member record',
            "SELECT u.id, u.name, u.zone_id AS user_zone, m.zone_id AS member_zone FROM members m JOIN users u ON u.id = m.user_id WHERE m.deleted_at IS NULL AND NOT (u.zone_id <=> m.zone_id)",
            "UPDATE users u JOIN members m ON m.user_id = u.id SET u.zone_id = m.zone_id WHERE m.deleted_at IS NULL AND NOT (u.zone_id <=> m.zone_id)", $fix);

        $this->check('Pastor accounts in a different zone than their pastor record',
            "SELECT u.id, u.name, u.zone_id AS user_zone, p.zone_id AS pastor_zone FROM pastors p JOIN users u ON u.id = p.user_id WHERE p.deleted_at IS NULL AND NOT (u.zone_id <=> p.zone_id)",
            "UPDATE users u JOIN pastors p ON p.user_id = u.id SET u.zone_id = p.zone_id WHERE p.deleted_at IS NULL AND NOT (u.zone_id <=> p.zone_id)", $fix);

        $this->check('Pastors whose region is not their zone\'s region',
            "SELECT p.id, p.name, p.region_id, z.region_id AS zone_region FROM pastors p JOIN zones z ON z.id = p.zone_id WHERE p.deleted_at IS NULL AND NOT (p.region_id <=> z.region_id)",
            "UPDATE pastors p JOIN zones z ON z.id = p.zone_id SET p.region_id = z.region_id WHERE p.deleted_at IS NULL AND NOT (p.region_id <=> z.region_id)", $fix);

        // ── Department and home group: stored on both the member and the account; fill whichever side is empty ──
        $this->check('Department set on the account but not on the member record',
            "SELECT u.id, u.name, u.department_id FROM members m JOIN users u ON u.id = m.user_id WHERE m.deleted_at IS NULL AND u.department_id IS NOT NULL AND m.department_id IS NULL",
            "UPDATE members m JOIN users u ON u.id = m.user_id SET m.department_id = u.department_id WHERE m.deleted_at IS NULL AND u.department_id IS NOT NULL AND m.department_id IS NULL", $fix);
        $this->check('Department set on the member record but not on the account',
            "SELECT u.id, u.name, m.department_id FROM members m JOIN users u ON u.id = m.user_id WHERE m.deleted_at IS NULL AND m.department_id IS NOT NULL AND u.department_id IS NULL",
            "UPDATE users u JOIN members m ON m.user_id = u.id SET u.department_id = m.department_id WHERE m.deleted_at IS NULL AND m.department_id IS NOT NULL AND u.department_id IS NULL", $fix);
        $this->check('Home group set on the account but not on the member record',
            "SELECT u.id, u.name, u.home_group_id FROM members m JOIN users u ON u.id = m.user_id WHERE m.deleted_at IS NULL AND u.home_group_id IS NOT NULL AND m.home_group_id IS NULL",
            "UPDATE members m JOIN users u ON u.id = m.user_id SET m.home_group_id = u.home_group_id WHERE m.deleted_at IS NULL AND u.home_group_id IS NOT NULL AND m.home_group_id IS NULL", $fix);
        $this->check('Home group set on the member record but not on the account',
            "SELECT u.id, u.name, m.home_group_id FROM members m JOIN users u ON u.id = m.user_id WHERE m.deleted_at IS NULL AND m.home_group_id IS NOT NULL AND u.home_group_id IS NULL",
            "UPDATE users u JOIN members m ON m.user_id = u.id SET u.home_group_id = m.home_group_id WHERE m.deleted_at IS NULL AND m.home_group_id IS NOT NULL AND u.home_group_id IS NULL", $fix);

        // ── Date of birth: the ID card and birthday greetings read it ──
        $this->check('Date of birth known on one side only (account vs member record)',
            "SELECT u.id, u.name FROM members m JOIN users u ON u.id = m.user_id WHERE m.deleted_at IS NULL AND (m.date_of_birth IS NULL) <> (u.date_of_birth IS NULL)",
            ["UPDATE members m JOIN users u ON u.id = m.user_id SET m.date_of_birth = u.date_of_birth WHERE m.deleted_at IS NULL AND m.date_of_birth IS NULL AND u.date_of_birth IS NOT NULL",
             "UPDATE users u JOIN members m ON m.user_id = u.id SET u.date_of_birth = m.date_of_birth WHERE m.deleted_at IS NULL AND u.date_of_birth IS NULL AND m.date_of_birth IS NOT NULL"], $fix);

        // ── Money: finance roll-ups group by payments.zone_id, so a payment without a zone vanishes from its zone ──
        $this->check('Payments with no zone although the payer belongs to one',
            "SELECT p.id, p.receipt_number, p.user_id FROM payments p JOIN users u ON u.id = p.user_id WHERE p.zone_id IS NULL AND u.zone_id IS NOT NULL AND p.deleted_at IS NULL",
            "UPDATE payments p JOIN users u ON u.id = p.user_id SET p.zone_id = u.zone_id WHERE p.zone_id IS NULL AND u.zone_id IS NOT NULL AND p.deleted_at IS NULL", $fix);

        // ── Identity: a login's role must have its matching record ──
        $this->check('Pastor accounts without a pastor record',
            "SELECT u.id, u.name FROM users u LEFT JOIN pastors p ON p.user_id = u.id AND p.deleted_at IS NULL WHERE u.role = 'pastor' AND u.is_active = 1 AND p.id IS NULL", null, $fix);
        $this->check('Member, partner and HOD accounts without a member record',
            "SELECT u.id, u.name FROM users u LEFT JOIN members m ON m.user_id = u.id AND m.deleted_at IS NULL WHERE u.role IN ('member', 'partner', 'hod') AND u.is_active = 1 AND m.id IS NULL", null, $fix);
        $this->check('Pastor code differs from the account\'s sign-in code',
            "SELECT u.id, u.name, p.code, u.unique_code FROM pastors p JOIN users u ON u.id = p.user_id WHERE p.deleted_at IS NULL AND NOT (p.code <=> u.unique_code)", null, $fix);
        $this->check('Members pointing at a zone that does not exist',
            "SELECT m.id, m.member_number, m.zone_id FROM members m LEFT JOIN zones z ON z.id = m.zone_id WHERE m.deleted_at IS NULL AND m.zone_id IS NOT NULL AND z.id IS NULL", null, $fix);
        $this->check('Duplicate member numbers',
            "SELECT member_number, COUNT(*) AS n FROM members WHERE deleted_at IS NULL AND member_number IS NOT NULL GROUP BY member_number HAVING n > 1", null, $fix);
        $this->check('Home groups whose leader is not an active member of that zone',
            "SELECT h.id, h.name, h.leader_id FROM home_groups h JOIN users u ON u.id = h.leader_id WHERE h.leader_id IS NOT NULL AND (u.is_active = 0 OR NOT (u.zone_id <=> h.zone_id))", null, $fix);

        $this->newLine();
        $this->line($this->problems === 0
            ? '<info>All checks passed: the data is consistent.</info>'
            : "<comment>{$this->problems} kind(s) of problem found" . ($fix ? ", {$this->repaired} repaired." : '. Run with --fix to repair the ones that can be repaired safely.') . '</comment>');

        return self::SUCCESS;
    }

    /** @param string|array|null $repair SQL that fixes it, or null when a person has to decide */
    private function check(string $label, string $find, string|array|null $repair, bool $fix): void
    {
        $rows = DB::select($find);

        if (!$rows) {
            $this->line("  <info>ok</info>   {$label}");

            return;
        }

        $this->problems++;
        $this->line('  <error> !! </error> ' . $label . ' — ' . count($rows) . ' found');
        foreach (array_slice($rows, 0, 3) as $r) {
            $this->line('         ' . json_encode($r));
        }

        if (!$fix) {
            return;
        }

        if ($repair === null) {
            $this->line('         <comment>needs a person to decide; not changed</comment>');

            return;
        }

        $changed = 0;
        foreach ((array) $repair as $sql) {
            $changed += DB::affectingStatement($sql);
        }
        $this->repaired++;
        $this->line("         <info>repaired {$changed} row(s)</info>");

        AuditLog::create([
            'user_id' => \App\Models\User::where('role', 'master')->value('id') ?? 1, 'actor_id' => null,
            'action' => 'data.repaired', 'details' => ['check' => $label, 'rows' => $changed], 'occurred_at' => now(),
        ]);
    }
}
