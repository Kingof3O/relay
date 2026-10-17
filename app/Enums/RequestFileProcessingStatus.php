<?php

namespace App\Enums;

enum RequestFileProcessingStatus: string
{
    case Processing = 'processing';
    case Ready = 'ready';
    case Failed = 'failed';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}
