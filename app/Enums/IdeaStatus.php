<?php

declare(strict_types=1);

namespace App\Enums;

enum IdeaStatus: string
{
    case New = 'new';
    case InProgress = 'in_progress';
    case WaitingForReply = 'waiting_for_reply';
    case NeedsInfo = 'needs_info';
    case NeedsChanges = 'needs_changes';
    case PartiallyDone = 'partially_done';
    case Done = 'done';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $status): string => $status->value,
            self::cases(),
        );
    }
}
