<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MarketListingResource\Pages;
use App\Models\Market\Listing;
use App\Services\Market\MarketService;
use App\Services\Community\ModerationService;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/** Every product and service partners have listed: suspend or reinstate, or remove. */
class MarketListingResource extends Resource
{
    protected static ?string $model = Listing::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 6;
    protected static ?string $modelLabel = 'listing';
    protected static ?string $pluralModelLabel = 'Marketplace listings';
    protected static ?string $slug = 'market-listings';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }
    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('seller:id,name'))
            ->defaultSort('id', 'desc')
            ->columns([
                Tables\Columns\ImageColumn::make('thumb')->label('')->state(fn (Listing $record) => $record->images[0] ?? null)->width(48)->height(48)->extraImgAttributes(['style' => 'border-radius:10px;object-fit:cover']),
                Tables\Columns\TextColumn::make('title')->searchable()->weight('semibold')->limit(40)->description(fn (Listing $record) => $record->category),
                Tables\Columns\TextColumn::make('seller.name')->label('Seller')->searchable(),
                Tables\Columns\TextColumn::make('price')->state(fn (Listing $record) => $record->price_type === 'quote' ? 'By quote' : number_format((float) $record->price, 2) . ' ' . $record->currency),
                Tables\Columns\TextColumn::make('stock')->placeholder('∞')->numeric(),
                Tables\Columns\TextColumn::make('orders_count')->label('Orders')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('views_count')->label('Views')->numeric()->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn ($state) => match ($state) { 'active' => 'success', 'suspended' => 'danger', default => 'warning' }),
                Tables\Columns\TextColumn::make('created_at')->label('Listed')->date('d M Y')->sortable()->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(['active' => 'Active', 'paused' => 'Paused', 'sold_out' => 'Sold out', 'suspended' => 'Suspended']),
                Tables\Filters\SelectFilter::make('category')->options(array_combine(MarketService::CATEGORIES, MarketService::CATEGORIES)),
            ])
            ->actions([
                Tables\Actions\Action::make('suspend')->label('Suspend')->icon('heroicon-o-no-symbol')->color('danger')
                    ->visible(fn (Listing $record) => $record->status !== 'suspended')
                    ->form([Forms\Components\Textarea::make('reason')->label('Reason (the seller is told)')->rows(2)->maxLength(190)])
                    ->action(function (Listing $record, array $data) {
                        app(ModerationService::class)->setListingStatus($record, 'suspended', auth()->user(), $data['reason'] ?? null);
                        Notification::make()->title('Listing suspended')->success()->send();
                    }),
                Tables\Actions\Action::make('reinstate')->label('Reinstate')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Listing $record) => $record->status === 'suspended')
                    ->action(function (Listing $record) {
                        app(ModerationService::class)->setListingStatus($record, 'active', auth()->user());
                        Notification::make()->title('Listing is live again')->success()->send();
                    }),
                Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListMarketListings::route('/')];
    }
}
