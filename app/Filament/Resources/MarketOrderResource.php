<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MarketOrderResource\Pages;
use App\Models\Market\Order;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/** Read-only oversight of marketplace orders (payment is between buyer and seller; head office sees the record). */
class MarketOrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-receipt-percent';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 7;
    protected static ?string $modelLabel = 'order';
    protected static ?string $pluralModelLabel = 'Marketplace orders';
    protected static ?string $slug = 'market-orders';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }
    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with(['listing:id,title', 'buyer:id,name', 'seller:id,name']))
            ->defaultSort('id', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('reference')->searchable()->weight('semibold'),
                Tables\Columns\TextColumn::make('listing.title')->label('Item')->limit(36)->searchable(),
                Tables\Columns\TextColumn::make('buyer.name')->label('Buyer')->searchable(),
                Tables\Columns\TextColumn::make('seller.name')->label('Seller')->searchable(),
                Tables\Columns\TextColumn::make('quantity')->numeric()->alignEnd(),
                Tables\Columns\TextColumn::make('total')->state(fn (Order $record) => number_format((float) $record->total, 2) . ' ' . $record->currency)->alignEnd(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn ($state) => match ($state) { 'completed', 'paid' => 'success', 'rejected', 'cancelled' => 'gray', 'pending' => 'warning', default => 'info' }),
                Tables\Columns\TextColumn::make('created_at')->label('Placed')->dateTime('d M H:i')->sortable(),
            ])
            ->filters([Tables\Filters\SelectFilter::make('status')->options(['pending' => 'Pending', 'accepted' => 'Accepted', 'paid' => 'Paid', 'shipped' => 'Shipped', 'completed' => 'Completed', 'rejected' => 'Declined', 'cancelled' => 'Cancelled'])->multiple()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListMarketOrders::route('/')];
    }
}
