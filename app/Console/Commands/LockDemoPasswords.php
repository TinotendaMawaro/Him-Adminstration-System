<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Replaces the shared demo password with a random one the owner cannot guess; people then use "Forgot password" to
 * choose their own. For the day demo data is turned into a live system.
 */
class LockDemoPasswords extends Command
{
    protected $signature = 'him:lock-demo-passwords {--force : Do not ask for confirmation}';
    protected $description = 'Replace every account that still uses the demo password with a random one';

    public function handle(): int
    {
        $demo = User::query()->get(['id', 'email', 'password'])->filter(fn (User $u) => Hash::check('password', $u->password));

        if ($demo->isEmpty()) {
            $this->info('No account uses the demo password.');

            return self::SUCCESS;
        }

        if (!$this->option('force') && !$this->confirm("This will lock {$demo->count()} account(s) until their owners reset the password. Continue?")) {
            return self::FAILURE;
        }

        $demo->each(function (User $u) {
            $u->forceFill(['password' => Str::random(40)])->saveQuietly();   // quietly: no "password changed" alert emails
            $u->tokens()->delete();
        });

        $this->info("Locked {$demo->count()} account(s).");

        return self::SUCCESS;
    }
}
