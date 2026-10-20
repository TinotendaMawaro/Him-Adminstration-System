<?php

namespace App\Filament\Widgets\Events;

use App\Filament\Resources\EventResource;
use App\Filament\Support\GatedByRole;
use App\Models\Event;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class UpcomingEventsTable extends TableWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'event'];
    protected static ?string $heading = 'Upcoming events';
    protected static ?int $sort = 5;
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Event::query()
                    ->where('starts_at', '>', now())->whereIn('status', ['published', 'draft'])
                    ->withCount(['registrations as active_registrations' => fn ($q) => $q->where('status', '!=', 'cancelled')])
            )
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->limit(40),
                Tables\Columns\TextColumn::make('starts_at')->dateTime('D, d M Y H:i')->sortable(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('venue_name')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('active_registrations')->label('Registered')
                    ->formatStateUsing(fn ($state, Event $r) => $r->capacity ? "$state / {$r->capacity}" : (string) $state),
                Tables\Columns\TextColumn::make('fill')->label('Filled')->state(fn (Event $r) => $r->capacity ? round($r->active_registrations / $r->capacity * 100) . '%' : '—')
                    ->badge()->color(fn ($state) => $state === '—' ? 'gray' : ((int) $state >= 90 ? 'danger' : ((int) $state >= 60 ? 'warning' : 'success'))),
            ])
            ->defaultSort('starts_at')
            ->actions([
                Tables\Actions\Action::make('manage')->label('Manage')->icon('heroicon-o-arrow-right')
                    ->url(fn (Event $r) => EventResource::getUrl('edit', ['record' => $r])),
            ])
            ->paginated([5, 10])
            ->defaultPaginationPageOption(5);
    }
}
