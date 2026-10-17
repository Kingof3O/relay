<?php

namespace App\Enums;

enum RequestPriority: string
{
    case Urgent = 'urgent';
    case Normal = 'normal';
    case Low = 'low';

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /** @return array<string, string> */
    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn (self $priority) => [
            $priority->value => $priority->label(),
        ])->all();
    }
}
