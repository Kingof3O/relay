<?php

namespace App\Services;

use App\Models\RequestActivity;
use App\Models\RequestFile;
use App\Models\WorkRequest;

final class WorkRequestPresenter
{
    /** @return array<string, mixed> */
    public function card(WorkRequest $request): array
    {
        return $this->base($request, false);
    }

    /** @return array<string, mixed> */
    public function detail(WorkRequest $request): array
    {
        return $this->base($request, true);
    }

    /** @return array<string, mixed> */
    private function base(WorkRequest $request, bool $includeDetail): array
    {
        $request->loadMissing(['area', 'requester', 'assignee', 'cycle']);

        $isOverdue = false;
        $dueHuman = null;
        if ($request->due_date) {
            $dueDate = $request->due_date->copy()->startOfDay();
            $today = now()->startOfDay();
            $diff = (int) $today->diffInDays($dueDate, false);
            $statusValue = $request->status?->value ?? (string) $request->getRawOriginal('status');

            if ($diff < 0 && $statusValue !== 'done') {
                $isOverdue = true;
            }

            if ($diff < 0) {
                $days = abs($diff);
                $dueHuman = "Overdue by {$days}d";
            } elseif ($diff === 0) {
                $dueHuman = 'Due today';
            } elseif ($diff === 1) {
                $dueHuman = 'Due tomorrow';
            } else {
                $dueHuman = "Due in {$diff}d";
            }
        }

        $subtasks = $request->relationLoaded('subtasks')
            ? $request->subtasks
            : $request->subtasks()->get();

        $totalSubtasks = $subtasks->count();
        $completedSubtasks = $subtasks->filter(function ($sub) {
            $st = $sub->status?->value ?? (string) $sub->getRawOriginal('status');
            return $st === 'done';
        })->count();

        $payload = [
            'id' => $request->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status?->value ?? (string) $request->getRawOriginal('status'),
            'status_label' => $request->status?->label() ?? ucfirst((string) $request->getRawOriginal('status')),
            'priority' => $request->priority?->value ?? (string) $request->getRawOriginal('priority'),
            'priority_label' => $request->priority?->label() ?? ucfirst((string) $request->getRawOriginal('priority')),
            'story_points' => $request->story_points !== null ? (int) $request->story_points : null,
            'parent_id' => $request->parent_id !== null ? (int) $request->parent_id : null,
            'cycle_id' => $request->cycle_id !== null ? (int) $request->cycle_id : null,
            'rolled_over_from_cycle_id' => $request->rolled_over_from_cycle_id !== null ? (int) $request->rolled_over_from_cycle_id : null,
            'cycle' => $request->cycle ? [
                'id' => $request->cycle->id,
                'number' => $request->cycle->number,
                'name' => $request->cycle->name,
                'start_date' => $request->cycle->start_date?->format('Y-m-d'),
                'end_date' => $request->cycle->end_date?->format('Y-m-d'),
                'is_active' => (bool) $request->cycle->is_active,
            ] : null,
            'subtasks_progress' => [
                'total' => $totalSubtasks,
                'completed' => $completedSubtasks,
                'percentage' => $totalSubtasks > 0 ? (int) round(($completedSubtasks / $totalSubtasks) * 100) : 0,
            ],
            'is_blocked' => (bool) $request->is_blocked,
            'blocked_reason' => $request->blocked_reason,
            'due_date' => $request->due_date?->format('Y-m-d'),
            'due_human' => $dueHuman,
            'is_overdue' => $isOverdue,
            'tags' => is_array($request->tags) ? array_values($request->tags) : [],
            'deleted_at' => $request->deleted_at?->toIso8601String(),
            'project' => $request->area?->only(['id', 'name', 'color']),
            'requester' => $request->requester?->only(['id', 'name', 'username']),
            'assignee' => $request->assignee?->only(['id', 'name', 'username']),
            'created_at' => $request->created_at?->toIso8601String(),
            'updated_at' => $request->updated_at?->toIso8601String(),
        ];

        if ($includeDetail) {
            $request->loadMissing([
                'files' => fn ($query) => $query->oldest('id'),
                'activities.user',
                'relations.related',
                'subtasks.assignee',
            ]);

            $payload['subtasks'] = $request->subtasks
                ->map(fn (WorkRequest $subtask): array => [
                    'id' => $subtask->id,
                    'title' => $subtask->title,
                    'status' => $subtask->status?->value ?? (string) $subtask->getRawOriginal('status'),
                    'status_label' => $subtask->status?->label() ?? ucfirst((string) $subtask->getRawOriginal('status')),
                    'priority' => $subtask->priority?->value ?? (string) $subtask->getRawOriginal('priority'),
                    'priority_label' => $subtask->priority?->label() ?? ucfirst((string) $subtask->getRawOriginal('priority')),
                    'story_points' => $subtask->story_points !== null ? (int) $subtask->story_points : null,
                    'assignee' => $subtask->assignee?->only(['id', 'name', 'username']),
                    'created_at' => $subtask->created_at?->toIso8601String(),
                ])
                ->values()
                ->all();

            $payload['files'] = $request->files->map(fn (RequestFile $file): array => $this->file($request, $file))->values()->all();
            $payload['activities'] = $request->activities
                ->sortBy('created_at')
                ->values()
                ->map(fn (RequestActivity $activity): array => [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'body' => $activity->body,
                    'metadata' => $activity->metadata,
                    'user' => $activity->user?->only(['id', 'name', 'username']),
                    'created_at' => $activity->created_at?->toIso8601String(),
                ])
                ->all();

            $payload['relations'] = $request->relations
                ->map(fn ($rel): array => [
                    'id' => $rel->id,
                    'request_id' => $rel->request_id,
                    'related_id' => $rel->related_id,
                    'type' => $rel->type,
                    'created_at' => $rel->created_at?->toIso8601String(),
                    'related' => $rel->related ? [
                        'id' => $rel->related->id,
                        'title' => $rel->related->title,
                        'status' => $rel->related->status?->value ?? (string) $rel->related->getRawOriginal('status'),
                        'status_label' => $rel->related->status?->label() ?? ucfirst((string) $rel->related->getRawOriginal('status')),
                        'priority' => $rel->related->priority?->value ?? (string) $rel->related->getRawOriginal('priority'),
                        'priority_label' => $rel->related->priority?->label() ?? ucfirst((string) $rel->related->getRawOriginal('priority')),
                        'is_blocked' => (bool) $rel->related->is_blocked,
                    ] : null,
                ])
                ->values()
                ->all();
        } else {
            $request->loadCount('files');
            $payload['files_count'] = (int) $request->files_count;
            $payload['file_states'] = $request->relationLoaded('files')
                ? $request->files->pluck('processing_status')->map(fn ($status) => $status?->value ?? (string) $status)->values()->all()
                : [];
        }

        return $payload;
    }

    /** @return array<string, mixed> */
    private function file(WorkRequest $request, RequestFile $file): array
    {
        $ready = $file->processing_status?->value === 'ready';

        return [
            'id' => $file->id,
            'original_name' => $file->original_name,
            'type' => $file->type,
            'mime_type' => $file->mime_type,
            'original_mime_type' => $file->original_mime_type,
            'size' => $file->size,
            'processing_status' => $file->processing_status?->value ?? (string) $file->getRawOriginal('processing_status'),
            'processing_error' => $file->processing_error,
            'width' => $file->width,
            'height' => $file->height,
            'duration' => $file->duration,
            'uploader' => $file->uploader?->only(['id', 'name', 'username']),
            'created_at' => $file->created_at?->toIso8601String(),
            'url' => $ready && filled($file->stored_path)
                ? route('requests.files.show', [$request, $file])
                : null,
            'preview_url' => $ready && filled($file->preview_path)
                ? route('requests.files.preview', [$request, $file])
                : null,
        ];
    }
}
