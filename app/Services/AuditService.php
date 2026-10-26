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

        $sanitizedOld = ! empty($old) ? $this->sanitizeValues($old) : null;
        $sanitizedNew = ! empty($new) ? $this->sanitizeValues($new) : null;

        return WorkspaceAudit::query()->create([
            'workspace_id' => $wsId,
            'user_id' => $actor?->id,
            'event' => $event,
            'auditable_type' => $auditable ? get_class($auditable) : null,
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $sanitizedOld,
            'new_values' => $sanitizedNew,
            'ip_address' => request()?->ip(),
            'created_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    public function sanitizeValues(array $values): array
    {
        $sensitiveKeys = [
            'password',
            'password_confirmation',
            'current_password',
            'two_factor_secret',
            'two_factor_recovery_codes',
            'recovery_code',
            'token',
            'plain_text_token',
            'plaintexttoken',
            'personal_access_token',
            'api_token',
            'secret',
            'app_secret',
            'reverb_app_secret',
            'smtp_password',
            'github_client_secret',
            'google_client_secret',
        ];

        $sanitized = [];
        foreach ($values as $key => $val) {
            $lowerKey = strtolower((string) $key);
            $isSensitive = false;
            foreach ($sensitiveKeys as $sk) {
                if (str_contains($lowerKey, $sk)) {
                    $isSensitive = true;
                    break;
                }
            }

            if ($isSensitive) {
                $sanitized[$key] = '[REDACTED]';
            } elseif (is_array($val)) {
                $sanitized[$key] = $this->sanitizeValues($val);
            } else {
                $sanitized[$key] = $val;
            }
        }

        return $sanitized;
    }
}
