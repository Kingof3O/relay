<?php

namespace App\Enums;

enum RequestStatus: string
{
    case New = 'new';
    case Ready = 'ready';
    case Doing = 'doing';
    case Review = 'review';
    case Done = 'done';

    public function label(): string
    {
        return match ($this) {
            self::New => 'New',
            self::Ready => 'Ready',
            self::Doing => 'Doing',
            self::Review => 'Review',
            self::Done => 'Done',
        };
    }

    /** @return array<string, string> */
    public static function options(): array
    {
        return collect(self::cases())->mapWithKeys(fn (self $status) => [
            $status->value => $status->label(),
        ])->all();
    }
}
