<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class StoredFile extends Model
{
    use HasFactory;

    protected $table = 'files';

    protected $fillable = [
        'project_id',
        'idea_id',
        'follow_up_id',
        'uploader_id',
        'original_name',
        'disk',
        'path',
        'mime_type',
        'type',
        'size',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function idea(): BelongsTo
    {
        return $this->belongsTo(Idea::class);
    }

    public function followUp(): BelongsTo
    {
        return $this->belongsTo(FollowUp::class, 'follow_up_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
