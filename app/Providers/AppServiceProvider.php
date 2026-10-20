<?php

namespace App\Providers;

use App\Models\Member;
use App\Models\User;
use App\Observers\MemberObserver;
use App\Observers\UserObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Member::observe(MemberObserver::class);
        User::observe(UserObserver::class);
    }
}
