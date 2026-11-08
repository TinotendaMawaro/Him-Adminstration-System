<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use App\Services\AuditTrail;
use App\Services\Community\CommunityService;
use App\Support\Mailing;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Create a head-office account (master / finance / events) WITHOUT ever choosing or sending a password: the person gets an
 * email with a secure link to set their own.
 *
 *   php artisan him:create-staff heartfeltzim@gmail.com "Heartfelt International Ministry" --role=master
 */
class CreateStaff extends Command
{
    protected $signature = 'him:create-staff {email} {name} {--role=master : master, finance or event}';
    protected $description = 'Create a staff account and email its owner a link to set their own password';

    public function handle(CommunityService $community): int
    {
        $email = Str::lower(trim($this->argument('email')));
        $role = $this->option('role');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !in_array($role, ['master', 'finance', 'event'], true)) {
            $this->error('Use a valid email and --role=master|finance|event.');

            return self::FAILURE;
        }
        if (User::where('email', $email)->exists()) {
            $this->error("An account for {$email} already exists.");

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $this->argument('name'), 'email' => $email, 'password' => Str::random(48),     // unknowable: the owner sets their own below
            'role' => UserRole::from($role), 'is_active' => true, 'terms_accepted' => true, 'terms_accepted_at' => now(), 'completed_tour' => true,
        ]);
        $community->profile($user);
        AuditTrail::record('user.staff_created', null, $user, ['role' => $role, 'via' => 'cli'], $user->id);

        $token = Password::broker()->createToken($user);
        $url = route('password.reset.form', ['token' => $token, 'email' => $user->email]);
        $sent = Mailing::to($user, new ResetPasswordMail($user, $url, (int) config('auth.passwords.users.expire', 60)));

        $this->info("Created {$role} account for {$email}.");
        $this->line($sent ? "A link to choose a password was emailed to {$email} (valid for " . config('auth.passwords.users.expire', 60) . ' minutes).' : '<comment>The email could not be sent (mail disabled or address blocked). Use "Forgot password" on the sign-in page.</comment>');

        return self::SUCCESS;
    }
}
