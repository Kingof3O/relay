<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\WorkspaceAudit;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    /**
     * Log a workspace governance event.
     *
     * @param  array<string, mixed>  $old
     * @param  array<string, mixed>  $new
     */
    public function log(
        ?User $actor,
        string $event,
        ?Model $auditable = null,
        array $old = [],
        array $new = []
    ): WorkspaceAudit {
        return WorkspaceAudit::query()->create([
            'user_id' => $actor?->id,
            'event' => $event,
            'auditable_type' => $auditable ? get_class($auditable) : null,
            'auditable_id' => $auditable?->getKey(),
            'old_values' => ! empty($old) ? $old : null,
            'new_values' => ! empty($new) ? $new : null,
            'ip_address' => request()?->ip(),
            'created_at' => now(),
        ]);
    }
}
