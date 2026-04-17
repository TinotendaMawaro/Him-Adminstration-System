<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CheckUsers extends Command
{
    protected $signature = 'check:users';

    public function handle()
    {
        $users = User::all();
        $this->info('Total users: ' . $users->count());
        
        foreach ($users as $user) {
            $this->line($user->email . ' - ' . $user->role->value . ' - code: ' . ($user->unique_code ?? 'NULL') . ' - active: ' . ($user->is_active ? 'yes' : 'no'));
        }
        
        return 0;
    }
}