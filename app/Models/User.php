<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

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
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
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

        return $this->role()
            ->whereHas('permissions', function (Builder $query) use ($permission): void {
                $query->where('name', $permission);
            })
            ->exists();
    }
}
