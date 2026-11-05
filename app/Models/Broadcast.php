<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Broadcast extends Model
{
    protected $fillable = ['sender_id', 'subject', 'body', 'audience_type', 'audience', 'email_copy', 'recipients_count'];

    protected $casts = [
        'audience'   => 'array',
        'email_copy' => 'boolean',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
