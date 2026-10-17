<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\IdeaStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Idea extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'content',
        'status',
        'progress',
        'assigned_to',
        'last_updated_by',
        'last_reply_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => IdeaStatus::class,
            'progress' => 'integer',
            'last_reply_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function lastUpdatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_updated_by');
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(StoredFile::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
