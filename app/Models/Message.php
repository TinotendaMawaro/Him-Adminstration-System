<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'department_id',
        'content',
        'type',
        'recipient_type',
        'is_read',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the sender of the message.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the receiver of the message.
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Get the department for group messages.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Scope for direct messages.
     */
    public function scopeDirect($query)
    {
        return $query->where('type', 'direct');
    }

    /**
     * Scope for announcements.
     */
    public function scopeAnnouncements($query)
    {
        return $query->where('type', 'announcement');
    }

    /**
     * Scope for notices.
     */
    public function scopeNotices($query)
    {
        return $query->where('type', 'notice');
    }

    /**
     * Scope for unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Get messages for a conversation between two users.
     */
    public static function conversation($userId1, $userId2)
    {
        return self::where(function ($query) use ($userId1, $userId2) {
            $query->where(function ($q) use ($userId1, $userId2) {
                $q->where('sender_id', $userId1)->where('receiver_id', $userId2);
            })->orWhere(function ($q) use ($userId1, $userId2) {
                $q->where('sender_id', $userId2)->where('receiver_id', $userId1);
            });
        })->orderBy('created_at', 'asc');
    }

    /**
     * Get unread count for a user.
     */
    public static function unreadCount($userId)
    {
        return self::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();
    }
}
