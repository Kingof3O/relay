<?php

namespace App\Models;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'requests';

    protected $fillable = [
        'workspace_id',
        'area_id',
        'cycle_id',
        'rolled_over_from_cycle_id',
        'parent_id',
        'title',
        'description',
        'status',
        'priority',
        'story_points',
        'requester_id',
        'assignee_id',
        'is_blocked',
        'blocked_reason',
        'due_date',
        'tags',
        'lock_version',
    ];

    protected function casts(): array
    {
        return [
            'status' => RequestStatus::class,
            'priority' => RequestPriority::class,
            'story_points' => 'integer',
            'parent_id' => 'integer',
            'cycle_id' => 'integer',
            'rolled_over_from_cycle_id' => 'integer',
            'is_blocked' => 'boolean',
            'due_date' => 'date',
            'tags' => 'array',
            'lock_version' => 'integer',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(RequestActivity::class, 'request_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(RequestFile::class, 'request_id');
    }

    public function relations(): HasMany
    {
        return $this->hasMany(RequestRelation::class, 'request_id');
    }

    public function pullRequests(): HasMany
    {
        return $this->hasMany(PullRequest::class, 'work_request_id');
    }

    public function blockedBy(): BelongsToMany
    {
        return $this->belongsToMany(WorkRequest::class, 'request_relations', 'request_id', 'related_id')
            ->withPivot('id', 'type')
            ->wherePivot('type', 'blocks')
            ->withTimestamps();
    }

    public function blocking(): BelongsToMany
    {
        return $this->belongsToMany(WorkRequest::class, 'request_relations', 'related_id', 'request_id')
            ->withPivot('id', 'type')
            ->wherePivot('type', 'blocks')
            ->withTimestamps();
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(Cycle::class, 'cycle_id');
    }

    public function rolledOverFromCycle(): BelongsTo
    {
        return $this->belongsTo(Cycle::class, 'rolled_over_from_cycle_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(WorkRequest::class, 'parent_id');
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(WorkRequest::class, 'parent_id')->orderBy('id');
    }

    public function scopeDueSoon(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->whereNotNull('due_date')
            ->where('due_date', '>=', now()->toDateString())
            ->where('due_date', '<=', now()->addDays(3)->toDateString())
            ->where('status', '!=', RequestStatus::Done->value);
    }

    public function scopeOverdue(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->where('status', '!=', RequestStatus::Done->value);
    }

    public function scopeFilter(\Illuminate\Database\Eloquent\Builder $query, array $filters, ?User $user = null): \Illuminate\Database\Eloquent\Builder
    {
        return $query
            ->when(!empty($filters['project']) || !empty($filters['area']), function (\Illuminate\Database\Eloquent\Builder $query) use ($filters): void {
                $projectId = !empty($filters['project']) ? (int) $filters['project'] : (int) $filters['area'];
                $query->where('area_id', $projectId);
            })
            ->when(!empty($filters['owner']), fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('assignee_id', (int) $filters['owner']))
            ->when(!empty($filters['requester']), fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('requester_id', (int) $filters['requester']))
            ->when(!empty($filters['status']), fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('status', (string) $filters['status']))
            ->when(!empty($filters['priority']), fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('priority', (string) $filters['priority']))
            ->when(!empty($filters['cycle']), fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('cycle_id', (int) $filters['cycle']))
            ->when(!empty($filters['my_work']) && $user, fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where(function (\Illuminate\Database\Eloquent\Builder $query) use ($user): void {
                $query->where('assignee_id', $user->id)->orWhere('requester_id', $user->id);
            }))
            ->when(!empty($filters['blocked']) || !empty($filters['is_blocked']), fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('is_blocked', true))
            ->when(!empty($filters['search']), function (\Illuminate\Database\Eloquent\Builder $query) use ($filters): void {
                $search = '%'.(string) $filters['search'].'%';
                $query->where(fn (\Illuminate\Database\Eloquent\Builder $query) => $query->where('title', 'like', $search)->orWhere('description', 'like', $search));
            });
    }

    public function scopeForWorkspace(\Illuminate\Database\Eloquent\Builder $query, int|Workspace $workspace): \Illuminate\Database\Eloquent\Builder
    {
        $workspaceId = $workspace instanceof Workspace ? $workspace->id : $workspace;

        return $query->where('workspace_id', $workspaceId);
    }
}
