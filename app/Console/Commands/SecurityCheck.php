<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * A pre-launch safety check: configuration and data that are fine on a developer laptop but dangerous on a real server.
 * Exits non-zero when something serious is found, so it can gate a deployment.
 */
class SecurityCheck extends Command
{
    protected $signature = 'him:security-check';
    protected $description = 'Check for settings and accounts that must be fixed before going live';

    private int $serious = 0;

    public function handle(): int
    {
        $this->section('Configuration');
        $this->test(!config('app.debug'), 'APP_DEBUG is off', 'APP_DEBUG is ON: error pages expose code, queries and secrets. Set APP_DEBUG=false.');
        $this->test(app()->environment('production'), 'APP_ENV is production', 'APP_ENV is "' . app()->environment() . '". Set APP_ENV=production on the live server.', false);
        $this->test(str_starts_with((string) config('app.url'), 'https://'), 'APP_URL uses HTTPS', 'APP_URL is "' . config('app.url') . '". Cards, receipts and emails link to it: use the real https:// address.');
        $this->test((bool) config('session.secure'), 'Session cookies are HTTPS-only', 'SESSION_SECURE_COOKIE is not true. Set it once the site runs on HTTPS.');
        $this->test((int) config('hashing.bcrypt.rounds', 12) >= 10, 'Password hashing cost is adequate', 'BCRYPT_ROUNDS is below 10.');
        $this->test(config('database.connections.mysql.password') !== '' && config('database.connections.mysql.username') !== 'root', 'Database is not using root without a password', 'The database user is "root" or has no password. Create a dedicated user.');
        $this->test(!blank(config('payme.accounts.tithe.public_id') ?? config('payme.accounts.events.public_id')), 'Online payments are configured', 'No PayMe account is configured (online giving will be disabled).', false);
        $this->test(!blank(config('mailing.webhook_secret')), 'Email webhook secret is set (bounce handling)', 'RESEND_WEBHOOK_SECRET is empty: bounces and complaints are not recorded.', false);

        $this->section('Accounts');
        $demo = User::query()->where('is_active', true)->get(['id', 'email', 'password', 'role'])
            ->filter(fn (User $u) => Hash::check('password', $u->password));
        $this->test($demo->isEmpty(), 'No active account uses the demo password', $demo->count() . ' active account(s) still use the password "password" (' . $demo->take(3)->pluck('email')->implode(', ') . '…). Reset them, or run: php artisan him:lock-demo-passwords');

        $demoDomains = User::where('is_active', true)->where(fn ($q) => $q->where('email', 'like', '%@heartfelt.church')->orWhere('email', 'like', '%.test'))->count();
        $this->test($demoDomains === 0, 'No active accounts on demo email domains', "{$demoDomains} active account(s) use demo emails (heartfelt.church / .test): they cannot receive email and should not exist on a live system.", false);

        $masters = User::where('role', 'master')->where('is_active', true)->count();
        $this->test($masters >= 1 && $masters <= 3, 'Between 1 and 3 active master accounts', "{$masters} active master account(s). Keep the master role to as few people as possible.", false);

        $this->section('Activity (last 24 hours)');
        $failed = DB::table('audit_logs')->where('action', 'auth.failed')->where('occurred_at', '>=', now()->subDay())->count();
        $this->line("  {$failed} failed sign-in attempt(s)");

        $this->newLine();
        $this->line($this->serious === 0 ? '<info>No serious findings.</info>' : "<error> {$this->serious} serious finding(s) to fix before going live. </error>");

        return $this->serious === 0 ? self::SUCCESS : self::FAILURE;
    }

    private function section(string $title): void
    {
        $this->newLine();
        $this->line("<comment>{$title}</comment>");
    }

    private function test(bool $ok, string $pass, string $fail, bool $serious = true): void
    {
        if ($ok) {
            $this->line("  <info>ok</info>    {$pass}");

            return;
        }

        $this->line(($serious ? '  <error> !! </error> ' : '  <comment>warn</comment>  ') . $fail);
        $this->serious += $serious ? 1 : 0;
    }
}
