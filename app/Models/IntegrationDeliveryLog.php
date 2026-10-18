<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class IntegrationDeliveryLog extends Model
{
    use HasFactory;

    protected $table = 'integration_delivery_logs';

    protected $fillable = [
        'workspace_id',
        'channel',
        'event',
        'status',
        'target',
        'summary',
        'payload',
        'error_message',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
