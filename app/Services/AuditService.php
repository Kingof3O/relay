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
        array $new = [],
        ?int $workspaceId = null
    ): WorkspaceAudit {
        $wsId = $workspaceId
            ?? (isset($new['workspace_id']) ? (int) $new['workspace_id'] : null)
            ?? ($auditable && isset($auditable->workspace_id) ? (int) $auditable->workspace_id : null)
            ?? $actor?->currentWorkspace()?->id;

        return WorkspaceAudit::query()->create([
            'workspace_id' => $wsId,
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
