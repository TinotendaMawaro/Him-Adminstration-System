<?php

namespace App\Providers\Filament;

use App\Http\Middleware\SecurityHeaders;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\MenuItem;
use Filament\Panel;
use Filament\Support\Enums\MaxWidth;
use Filament\View\PanelsRenderHook;
use Illuminate\Contracts\View\View;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

/**
 * Shared look, feel and security baseline for the Master, Finance and Events portals.
 */
class PortalDefaults
{
    public const PORTALS = [
        'admin'   => ['label' => 'Master console', 'path' => '/admin',   'icon' => 'heroicon-o-shield-check',     'roles' => ['master']],
        'finance' => ['label' => 'Finance portal', 'path' => '/finance', 'icon' => 'heroicon-o-banknotes',        'roles' => ['master']],
        'events'  => ['label' => 'Events portal',  'path' => '/events',  'icon' => 'heroicon-o-calendar-days',    'roles' => ['master']],
    ];

    public static function apply(Panel $panel, string $brand, string $accentCss): Panel
    {
        $switch = [];
        foreach (self::PORTALS as $id => $p) {
            if ($id === $panel->getId()) {
                continue;
            }
            $switch[] = MenuItem::make()->label($p['label'])->url($p['path'])->icon($p['icon'])
                ->visible(fn () => auth()->user()?->hasAnyRole($p['roles']) ?? false);
        }

        return $panel
            ->login()
            ->passwordReset()
            ->brandName($brand)
            ->favicon(asset('images/favicon.ico'))
            ->font('Inter')
            ->maxContentWidth(MaxWidth::Full)
            ->sidebarCollapsibleOnDesktop()
            ->unsavedChangesAlerts()
            ->databaseTransactions()
            ->pages([\App\Filament\Pages\Shared\MyIdCard::class])
            ->userMenuItems($switch)
            ->renderHook(PanelsRenderHook::HEAD_END, fn (): View => view('filament.partials.premium-head', ['accent' => $accentCss]))
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
                SecurityHeaders::class,
            ])
            ->authMiddleware([Authenticate::class])
            ->authGuard('web');
    }
}
