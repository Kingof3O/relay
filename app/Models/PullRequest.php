<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class PullRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_request_id',
        'provider',
        'pr_number',
        'title',
        'url',
        'status',
        'is_draft',
        'review_status',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'pr_number' => 'integer',
            'is_draft' => 'boolean',
        ];
    }

    public function workRequest(): BelongsTo
    {
        return $this->belongsTo(WorkRequest::class, 'work_request_id');
    }
}
