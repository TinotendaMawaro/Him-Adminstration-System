<?php

namespace App\Filament\Resources\EventResource\RelationManagers;

use App\Enums\RegistrationStatus;
use App\Models\EventRegistration;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class RegistrationsRelationManager extends RelationManager
{
    protected static string $relationship = 'registrations';

    protected static ?string $title = 'Registrations';

    public static function canViewForRecord(Model $ownerRecord, string $pageName): bool
    {
        return auth()->user()?->can('manageRegistrations', $ownerRecord) ?? false;
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('reference_number')
            ->columns([
                TextColumn::make('reference_number')->label('Reference')->searchable(),
                TextColumn::make('user.name')->label('Name')->searchable(),
                TextColumn::make('user.email')->label('Email')->toggleable(),
                TextColumn::make('status')->badge()->sortable(),
                TextColumn::make('amount_due')->money('USD')->toggleable(),
                TextColumn::make('amount_paid')->money('USD')->toggleable(),
                TextColumn::make('created_at')->label('Registered')->dateTime('d M Y H:i')->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')->options(RegistrationStatus::class),
            ])
            ->headerActions([])
            ->actions([
                Tables\Actions\Action::make('confirm')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn (EventRegistration $r) => $r->status === RegistrationStatus::Pending)
                    ->requiresConfirmation()
                    ->action(fn (EventRegistration $r) => $r->update(['status' => RegistrationStatus::Confirmed])),
                Tables\Actions\Action::make('attended')
                    ->label('Mark attended')
                    ->icon('heroicon-o-user-plus')
                    ->color('info')
                    ->visible(fn (EventRegistration $r) => $r->status === RegistrationStatus::Confirmed)
                    ->action(fn (EventRegistration $r) => $r->update(['status' => RegistrationStatus::Attended])),
                Tables\Actions\Action::make('cancel')
                    ->icon('heroicon-o-x-mark')
                    ->color('danger')
                    ->visible(fn (EventRegistration $r) => in_array($r->status, [RegistrationStatus::Pending, RegistrationStatus::Confirmed], true))
                    ->requiresConfirmation()
                    ->action(fn (EventRegistration $r) => $r->update(['status' => RegistrationStatus::Cancelled])),
            ]);
    }
}
