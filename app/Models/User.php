<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\RoleName;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role_id',
        'active',
        'notification_preferences',
        'preferences',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'github_id',
        'google_id',
        'force_password_reset',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'active' => 'boolean',
            'notification_preferences' => 'array',
            'preferences' => 'array',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted:array',
            'two_factor_confirmed_at' => 'datetime',
            'force_password_reset' => 'boolean',
        ];
    }

    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_confirmed_at !== null && ! empty($this->two_factor_secret);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class, 'workspace_user')
            ->withPivot('id', 'role_id')
            ->withTimestamps();
    }

    public function ownedWorkspaces(): HasMany
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    public function currentWorkspace(): ?Workspace
    {
        $activeId = session('active_workspace_id');

        if ($activeId) {
            $workspace = $this->workspaces()->where('workspaces.id', $activeId)->first()
                ?? Workspace::query()->where('id', $activeId)->where('owner_id', $this->id)->first();
            if ($workspace) {
                return $workspace;
            }
        }

        return $this->workspaces()->first() ?? $this->ownedWorkspaces()->first();
    }

    public function getCurrentWorkspaceAttribute(): ?Workspace
    {
        return $this->currentWorkspace();
    }

    public function requestedWork(): HasMany
    {
        return $this->hasMany(WorkRequest::class, 'requester_id');
    }

    public function assignedWork(): HasMany
    {
        return $this->hasMany(WorkRequest::class, 'assignee_id');
    }

    public function requestActivities(): HasMany
    {
        return $this->hasMany(RequestActivity::class);
    }

    public function uploadedRequestFiles(): HasMany
    {
        return $this->hasMany(RequestFile::class, 'uploader_id');
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->role_id === null) {
            return false;
        }

        // Owner role inherently possesses all permissions
        $roleName = $this->role?->name;
        if ($roleName === 'Owner' || $roleName === RoleName::Owner->value) {
            return true;
        }

        $exists = $this->role()
            ->whereHas('permissions', function (Builder $query) use ($permission): void {
                $query->where('name', $permission);
            })
            ->exists();

        if ($exists) {
            return true;
        }

        // Resilient fallback: core workspace roles inherently possess view_requests
        if ($permission === 'view_requests' && in_array($roleName, ['Developer', 'Designer', RoleName::Developer->value, RoleName::Designer->value], true)) {
            return true;
        }

        return false;
    }
}
