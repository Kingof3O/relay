<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cycle extends Model
{
    use HasFactory;

    protected $table = 'cycles';

    protected $fillable = [
        'workspace_id',
        'number',
        'name',
        'start_date',
        'end_date',
        'is_active',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'number' => 'integer',
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(WorkRequest::class, 'cycle_id');
    }

    public function rolledOverRequests(): HasMany
    {
        return $this->hasMany(WorkRequest::class, 'rolled_over_from_cycle_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('is_active', false)
            ->whereNull('completed_at')
            ->where('start_date', '>', now()->toDateString())
            ->orderBy('start_date');
    }

    public function scopeForWorkspace(Builder $query, int|Workspace $workspace): Builder
    {
        $workspaceId = $workspace instanceof Workspace ? $workspace->id : $workspace;

        return $query->where('workspace_id', $workspaceId);
    }
}
