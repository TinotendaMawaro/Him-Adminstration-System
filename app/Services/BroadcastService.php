<?php

namespace App\Services;

use App\Models\Broadcast;
use App\Models\Notification;
use App\Models\Pastor;
use App\Models\User;
use App\Observers\NotificationObserver;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The master console's message to pastors: everyone, a region, some zones, or chosen pastors one by one.
 * Each pastor gets an in-app notice (and, optionally, a copy by email); the send is recorded for the master.
 */
class BroadcastService
{
    public const AUDIENCES = ['all' => 'All pastors', 'regions' => 'Pastors of chosen regions', 'zones' => 'Pastors of chosen zones', 'pastors' => 'Chosen pastors'];

    /** Active pastor LOGINS for an audience. @return Collection<int, User> */
    public function recipients(string $type, array $ids = []): Collection
    {
        $pastors = Pastor::query()->whereNotNull('user_id');

        match ($type) {
            'regions' => $pastors->whereIn('region_id', $ids),
            'zones'   => $pastors->whereIn('zone_id', $ids),
            'pastors' => $pastors->whereIn('user_id', $ids),
            default   => null,
        };

        return User::whereIn('id', $pastors->pluck('user_id'))->where('is_active', true)->where('role', 'pastor')->get();
    }

    public function send(User $sender, string $subject, string $body, string $type, array $ids = [], bool $emailCopy = true): Broadcast
    {
        abort_unless($sender->isMaster(), 403, 'Only the master console can broadcast to pastors.');

        $type = array_key_exists($type, self::AUDIENCES) ? $type : 'all';
        $ids  = array_values(array_filter(array_map('intval', $ids)));

        if ($type !== 'all' && !$ids) {
            throw ValidationException::withMessages(['audience' => 'Choose who should receive this message.']);
        }

        $recipients = $this->recipients($type, $ids);
        if ($recipients->isEmpty()) {
            throw ValidationException::withMessages(['audience' => 'No active pastors match this audience.']);
        }

        return DB::transaction(function () use ($sender, $subject, $body, $type, $ids, $emailCopy, $recipients) {
            $broadcast = Broadcast::create([
                'sender_id' => $sender->id, 'subject' => $subject, 'body' => $body, 'audience_type' => $type,
                'audience' => $ids ?: null, 'email_copy' => $emailCopy, 'recipients_count' => $recipients->count(),
            ]);

            $make = fn () => $recipients->each(fn (User $u) => Notification::create([
                'user_id' => $u->id, 'title' => $subject, 'message' => $body,
                'type' => 'info', 'category' => 'broadcast', 'is_read' => false,
            ]));

            // The email copy is the observer's job; switch it off for an in-app-only message.
            $emailCopy ? $make() : NotificationObserver::withoutEmail($make);

            AuditTrail::record('broadcast.sent', $sender, $broadcast, [
                'subject' => $subject, 'audience' => $type, 'ids' => $ids, 'recipients' => $recipients->count(), 'email_copy' => $emailCopy,
            ]);

            return $broadcast;
        });
    }
}
