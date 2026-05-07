<?php

namespace App\Providers\Filament;

use App\Models\User;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\AuthenticateSession;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()

            // ── Branding ─────────────────────────────────────────────────────
            ->brandName('Heartfelt CMS')
            ->favicon(asset('images/favicon.ico'))

            // ── Colours ───────────────────────────────────────────────────────
            ->colors([
                'primary'   => Color::hex('#1e3a5f'), // deep navy
                'secondary' => Color::hex('#c9a84c'), // gold
            ])

            // ── Navigation groups (visibility controlled per-resource) ────────
            ->navigationGroups([
                NavigationGroup::make('Church Structure')
                    ->collapsed(),

                NavigationGroup::make('People')
                    ->collapsed(),

                NavigationGroup::make('Finance')
                    ->collapsed(),

                NavigationGroup::make('Events')
                    ->collapsed(),

                NavigationGroup::make('System Management')
                    ->collapsed(),
            ])

            // ── Auto-discover resources / pages / widgets ─────────────────────
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([Pages\Dashboard::class])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                Widgets\AccountWidget::class,
            ])

            // ── Middleware ───────────────────────────────────────────────────
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
            ])
            ->authMiddleware([Authenticate::class])

            // ── Auth gate: only Filament roles (master/hod/finance/event) ────
            ->authGuard('web');
    }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW ROLE-BASED RESOURCE VISIBILITY WORKS IN FILAMENT
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Each Filament Resource should override `canAccess()` and/or
 * `canViewAny()` / `canCreate()` etc. like so:
 *
 *  // In any Resource — e.g. PaymentResource.php
 *  public static function canAccess(): bool
 *  {
 *      return auth()->user()?->hasAnyRole(['master', 'finance']) ?? false;
 *  }
 *
 * Role matrix:
 *
 * | Resource / Action        | master | hod  | finance | event |
 * |--------------------------|--------|------|---------|-------|
 * | All resources            |   ✓    |      |         |       |
 * | Department resources     |   ✓    |  ✓   |         |       |
 * | Payment resources        |   ✓    |      |    ✓    |  *    |
 * | Event resources          |   ✓    |      |         |  ✓    |
 * | Member / People          |   ✓    |  ✓   |         |       |
 * | System Management        |   ✓    |      |         |       |
 *
 *  * event role: can view payment resources only for event registrations
 *
 * Add this to each resource class to enforce it:
 *
 * ── PaymentResource ──
 *  public static function canAccess(): bool {
 *      $user = auth()->user();
 *      return $user?->hasAnyRole(['master', 'finance', 'event']) ?? false;
 *  }
 *
 *  // Override the query to filter event role
 *  public static function getEloquentQuery(): Builder {
 *      $query = parent::getEloquentQuery();
 *      if (auth()->user()?->isEventRole()) {
 *          $query->whereNotNull('event_registration_id');
 *      }
 *      return $query;
 *  }
 *
 * ── DepartmentResource ──
 *  public static function canAccess(): bool {
 *      return auth()->user()?->hasAnyRole(['master', 'hod']) ?? false;
 *  }
 *  public static function getEloquentQuery(): Builder {
 *      $query = parent::getEloquentQuery();
 *      if (auth()->user()?->isHOD()) {
 *          $query->where('id', auth()->user()->department_id);
 *      }
 *      return $query;
 *  }
 */
