<?php

return [
    'moderation' => [
        'words' => [
            'exact' => [
            ],
            'patterns' => [
            ],
        ],
        'score_thresholds' => [
            'flagged'  => 3,
            'rejected' => 6,
        ],
    ],
    'notifications' => [
        'pastor_new_message'  => true,
        'member_new_reply'    => true,
        'member_status_change' => true,
    ],
    'rate_limits' => [
        'messages_per_hour' => 5,
        'replies_per_hour'   => 20,
    ],
];
