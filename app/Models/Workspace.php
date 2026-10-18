<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'owner_id',
        'logo_url',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_user')
            ->withPivot('id', 'role_id')
            ->withTimestamps();
    }

    public function requests(): HasMany
    {
        return $this->hasMany(WorkRequest::class, 'workspace_id');
    }

    public function areas(): HasMany
    {
        return $this->hasMany(Area::class, 'workspace_id');
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(WorkspaceInvitation::class, 'workspace_id');
    }

    public function audits(): HasMany
    {
        return $this->hasMany(WorkspaceAudit::class, 'workspace_id');
    }
}
