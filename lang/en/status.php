<?php

return [
    'statuses' => [
        'new' => 'New',
        'ready' => 'Ready',
        'doing' => 'In Progress',
        'review' => 'In Review',
        'done' => 'Done',
    ],
    'descriptions' => [
        'new' => 'Backlog and unassigned issues pending prioritization.',
        'ready' => 'Triaged issues ready to be picked up in current cycle.',
        'doing' => 'Active work items in flight.',
        'review' => 'Pending peer review or verification.',
        'done' => 'Completed issues.',
    ],
    'priorities' => [
        'urgent' => 'Urgent',
        'normal' => 'Normal',
        'low' => 'Low',
    ],
    'relations' => [
        'blocks' => 'Blocks',
        'is_blocked_by' => 'Is blocked by',
        'relates_to' => 'Relates to',
        'duplicate' => 'Duplicate of',
    ],
];
