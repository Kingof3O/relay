<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleName: string
{
    case Owner = 'Owner';
    case Developer = 'Developer';
    case Designer = 'Designer';
    case Stakeholder = 'Stakeholder';
}
