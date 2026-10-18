<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\WorkRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin WorkRequest
 */
final class WorkRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'workspace_id' => $this->workspace_id,
            'area_id' => $this->area_id,
            'parent_id' => $this->parent_id,
            'cycle_id' => $this->cycle_id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : (string) $this->status,
            'priority' => $this->priority instanceof \BackedEnum ? $this->priority->value : (string) $this->priority,
            'story_points' => $this->story_points !== null ? (int) $this->story_points : null,
            'is_blocked' => (bool) $this->is_blocked,
            'blocked_reason' => $this->blocked_reason,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'tags' => is_array($this->tags) ? array_values($this->tags) : [],
            'lock_version' => (int) ($this->lock_version ?? 1),
            'area' => new AreaResource($this->whenLoaded('area')),
            'requester' => $this->whenLoaded('requester', function () {
                return $this->requester ? [
                    'id' => $this->requester->id,
                    'name' => $this->requester->name,
                    'username' => $this->requester->username,
                    'email' => $this->requester->email,
                ] : null;
            }),
            'assignee' => $this->whenLoaded('assignee', function () {
                return $this->assignee ? [
                    'id' => $this->assignee->id,
                    'name' => $this->assignee->name,
                    'username' => $this->assignee->username,
                    'email' => $this->assignee->email,
                ] : null;
            }),
            'subtasks' => WorkRequestResource::collection($this->whenLoaded('subtasks')),
            'relations' => $this->whenLoaded('relations', function () {
                return $this->relations->map(fn ($rel): array => [
                    'id' => $rel->id,
                    'type' => $rel->type,
                    'related_id' => $rel->related_id,
                    'created_at' => $rel->created_at?->toIso8601String(),
                    'related' => $rel->related ? [
                        'id' => $rel->related->id,
                        'title' => $rel->related->title,
                        'status' => $rel->related->status instanceof \BackedEnum ? $rel->related->status->value : (string) $rel->related->status,
                        'priority' => $rel->related->priority instanceof \BackedEnum ? $rel->related->priority->value : (string) $rel->related->priority,
                    ] : null,
                ]);
            }),
            'pull_requests' => $this->whenLoaded('pullRequests', function () {
                return $this->pullRequests->map(fn ($pr): array => [
                    'id' => $pr->id,
                    'provider' => $pr->provider,
                    'pr_number' => $pr->pr_number,
                    'title' => $pr->title,
                    'url' => $pr->url,
                    'status' => $pr->status,
                    'is_draft' => (bool) $pr->is_draft,
                    'review_status' => $pr->review_status,
                    'created_at' => $pr->created_at?->toIso8601String(),
                ]);
            }),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
