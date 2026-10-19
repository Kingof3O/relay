<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleName: string
{
    case Owner = 'Owner';
    case Admin = 'Admin';
    case Developer = 'Developer';
    case Designer = 'Designer';
    case Member = 'Member';
    case Stakeholder = 'Stakeholder';
}
