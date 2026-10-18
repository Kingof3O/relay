<?php

namespace App\Services;

use App\Events\WorkRequestCommented;
use App\Events\WorkRequestMoved;
use App\Http\Requests\WorkRequest\BulkWorkRequestRequest;
use App\Jobs\DispatchOutgoingWebhook;
use App\Jobs\SendDiscordNotification;
use App\Jobs\SendRequestEmail;
use App\Models\RequestActivity;
use App\Models\RequestRelation;
use App\Models\User;
use App\Models\WorkRequest;
use App\Notifications\RequestDatabaseNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

final class WorkRequestService
{
    /** @param array<string, mixed> $attributes */
    public function create(User $actor, array $attributes): WorkRequest
    {
        return DB::transaction(function () use ($actor, $attributes): WorkRequest {
            $workspaceId = $attributes['workspace_id'] ?? $actor->currentWorkspace()?->id;

            $request = WorkRequest::query()->create([
                'workspace_id' => $workspaceId,
                'area_id' => $attributes['area_id'],
                'title' => $attributes['title'],
                'description' => $attributes['description'] ?? null,
                'status' => $attributes['status'] ?? 'new',
                'priority' => $attributes['priority'] ?? 'normal',
                'requester_id' => $attributes['requester_id'] ?? $actor->id,
                'assignee_id' => $attributes['assignee_id'] ?? null,
                'is_blocked' => (bool) ($attributes['is_blocked'] ?? false),
                'blocked_reason' => $attributes['blocked_reason'] ?? null,
                'story_points' => isset($attributes['story_points']) ? (int) $attributes['story_points'] : null,
                'parent_id' => $attributes['parent_id'] ?? null,
                'cycle_id' => $attributes['cycle_id'] ?? null,
                'due_date' => $attributes['due_date'] ?? null,
                'tags' => $attributes['tags'] ?? null,
            ]);

            $this->recordActivity($request, $actor, 'created', 'Request created.');

            if ($request->assignee_id) {
                $this->notifyRelevantUsers(
                    $request,
                    'assignment',
                    "{$actor->name} assigned this work request to you.",
                    $actor
                );
            } else {
                $createPayload = [
                    'event' => 'created',
                    'request_id' => $request->id,
                    'request_title' => $request->title,
                    'message' => "{$actor->name} created #REQ-{$request->id}: {$request->title}",
                    'url' => route('requests.show', $request),
                ];
                SendDiscordNotification::dispatch($request->id, $createPayload)->afterCommit();
            }

            if (($request->priority?->value ?? (string) $request->priority) === 'urgent' || $request->is_blocked) {
                DispatchOutgoingWebhook::dispatch($request->id)->afterCommit();
            }

            return $request;
        });
    }

    /** @param array<string, mixed> $attributes */
    public function update(WorkRequest $request, User $actor, array $attributes): WorkRequest
    {
        return DB::transaction(function () use ($request, $actor, $attributes): WorkRequest {
            $oldStatus = $request->status?->value ?? (string) $request->getRawOriginal('status');
            $oldAssigneeId = $request->assignee_id;
            $oldAssignee = $oldAssigneeId === null ? null : User::query()->find($oldAssigneeId);
            $oldPriority = $request->priority?->value ?? (string) $request->getRawOriginal('priority');
            $oldBlocked = (bool) $request->is_blocked;

            $hasLockVersion = array_key_exists('lock_version', $attributes);
            unset($attributes['lock_version']);

            $request->fill($attributes);

            if (array_key_exists('is_blocked', $attributes) && ! $request->is_blocked) {
                $request->blocked_reason = null;
            }

            if ($request->isDirty('description') || $hasLockVersion) {
                $request->lock_version = ((int) ($request->getOriginal('lock_version') ?: 1)) + 1;
            }

            $request->save();
            $request->loadMissing(['requester', 'assignee']);

            if ($request->wasChanged('status')) {
                $newStatus = $request->status?->value ?? (string) $request->getRawOriginal('status');
                $type = $oldStatus === 'done' && $newStatus !== 'done' ? 'reopened' : 'status_changed';
                $this->recordActivity($request, $actor, $type, "Status changed to {$request->status?->label()}.", [
                    'from' => $oldStatus,
                    'to' => $newStatus,
                ]);

                if ($newStatus === 'review') {
                    $this->notifyRelevantUsers($request, 'review', "{$actor->name} moved this request to Review.", $actor);
                } elseif ($newStatus === 'done') {
                    $this->recordActivity($request, $actor, 'approval', "{$actor->name} approved this request and marked it Done.", [
                        'from' => $oldStatus,
                        'to' => $newStatus,
                    ]);
                    $this->notifyRelevantUsers($request, 'done', "{$actor->name} marked this request Done.", $actor);
                    $this->resolveBlockedDependencies($request, $actor);
                } elseif ($type === 'reopened') {
                    $this->notifyRelevantUsers($request, 'reopened', "{$actor->name} reopened this request.", $actor);
                }
            }

            if ($request->wasChanged('assignee_id')) {
                $assigneeName = $request->assignee?->name ?? 'Unassigned';
                $this->recordActivity($request, $actor, 'assignment_changed', "Assigned to {$assigneeName}.", [
                    'from' => $oldAssigneeId,
                    'to' => $request->assignee_id,
                ]);
                $this->notifyRelevantUsers(
                    $request,
                    'assignment',
                    "{$actor->name} assigned this request to {$assigneeName}.",
                    $actor,
                    $oldAssignee === null ? [] : [$oldAssignee],
                );
            }

            if ($request->wasChanged('priority')) {
                $newPriority = $request->priority?->value ?? (string) $request->getRawOriginal('priority');
                $this->recordActivity($request, $actor, 'priority_changed', "Priority changed to {$request->priority?->label()}.", [
                    'from' => $oldPriority,
                    'to' => $newPriority,
                ]);
                if ($newPriority === 'urgent') {
                    DispatchOutgoingWebhook::dispatch($request->id)->afterCommit();
                }
            }

            if ($request->wasChanged('is_blocked')) {
                if ($request->is_blocked) {
                    $this->recordActivity($request, $actor, 'blocked', 'Request blocked.', [
                        'reason' => $request->blocked_reason,
                    ]);
                    $this->notifyRelevantUsers($request, 'blocked', "{$actor->name} blocked this request.", $actor);
                    DispatchOutgoingWebhook::dispatch($request->id)->afterCommit();
                } elseif ($oldBlocked) {
                    $this->recordActivity($request, $actor, 'unblocked', 'Request unblocked.');
                }
            }

            if ($request->wasChanged(['title', 'description', 'area_id'])) {
                $this->recordActivity($request, $actor, 'edited', 'Request details updated.');
            }

            WorkRequestMoved::dispatch(
                $request,
                $actor->id,
                $oldStatus,
                $request->status?->value ?? (string) $request->getRawOriginal('status'),
            );

            return $request;
        });
    }

    public function addComment(WorkRequest $request, User $actor, string $body): RequestActivity
    {
        $activity = $this->recordActivity($request, $actor, 'comment', $body);
        $this->notifyRelevantUsers($request, 'comment', "{$actor->name} commented on this request.", $actor);

        WorkRequestCommented::dispatch($request, $activity, $actor->id);

        return $activity;
    }

    /** @param array<string, mixed>|null $metadata */
    public function recordActivity(
        WorkRequest $request,
        ?User $actor,
        string $type,
        ?string $body = null,
        ?array $metadata = null,
    ): RequestActivity {
        return $request->activities()->create([
            'user_id' => $actor?->id,
            'type' => $type,
            'body' => $body,
            'metadata' => $metadata,
        ]);
    }

    /** @param array<int, User> $additionalUsers */
    public function notifyRelevantUsers(
        WorkRequest $request,
        string $event,
        string $message,
        ?User $actor = null,
        array $additionalUsers = [],
    ): void {
        $request->loadMissing(['requester', 'assignee']);
        $users = collect([$request->requester, $request->assignee, ...$additionalUsers])
            ->filter()
            ->unique('id')
            ->filter(fn (User $user): bool => $actor === null || $user->id !== $actor->id);

        $payload = [
            'event' => $event,
            'request_id' => $request->id,
            'request_title' => $request->title,
            'message' => $message,
            'url' => route('requests.show', $request),
        ];

        foreach ($users as $user) {
            $user->notify(new RequestDatabaseNotification($payload));
            SendRequestEmail::dispatch($user->id, $payload)->afterCommit();
        }

        // Dual dispatch: Deliver rich embed to Discord channel via webhook
        SendDiscordNotification::dispatch($request->id, $payload)->afterCommit();
    }

    public function delete(WorkRequest $request, RequestFileService $fileService): void
    {
        $request->loadMissing('files');

        DB::transaction(function () use ($request, $fileService): void {
            foreach ($request->files as $file) {
                $fileService->deleteStoredFiles($file);
            }

            $request->forceDelete();
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @param  (callable(WorkRequest): array<string, mixed>)|null  $presenter
     * @return array<int, array<string, mixed>>
     */
    public function bulkCreate(User $actor, array $rows, ?callable $presenter = null): array
    {
        $results = [];
        $chunkSize = max(1, (int) config('workspace.bulk_chunk_size', 25));
        $index = 0;

        foreach (array_chunk($rows, $chunkSize, true) as $chunk) {
            foreach ($chunk as $row) {
                $row = is_array($row) ? $row : [];
                $resultIndex = is_numeric($row['client_index'] ?? null)
                    ? (int) $row['client_index']
                    : $index;

                $validator = Validator::make($row, BulkWorkRequestRequest::rowRules());

                if ($validator->fails()) {
                    $results[] = [
                        'index' => $resultIndex,
                        'success' => false,
                        'errors' => $validator->errors()->toArray(),
                    ];
                    $index++;

                    continue;
                }

                try {
                    $created = $this->create($actor, $validator->validated());
                    $results[] = [
                        'index' => $resultIndex,
                        'success' => true,
                        'request' => $presenter !== null ? $presenter($created) : $created,
                    ];
                } catch (\Throwable $exception) {
                    report($exception);
                    $results[] = [
                        'index' => $resultIndex,
                        'success' => false,
                        'errors' => ['row' => ['This row could not be created.']],
                    ];
                }

                $index++;
            }
        }

        return $results;
    }

    public function resolveBlockedDependencies(WorkRequest $completedRequest, ?User $actor = null): void
    {
        $relations = RequestRelation::query()
            ->where('related_id', $completedRequest->id)
            ->where('type', 'blocks')
            ->get();

        foreach ($relations as $relation) {
            $blockedRequest = WorkRequest::query()->find($relation->request_id);
            if (! $blockedRequest) {
                continue;
            }

            $otherIncompleteBlockersCount = RequestRelation::query()
                ->where('request_id', $blockedRequest->id)
                ->where('type', 'blocks')
                ->where('related_id', '!=', $completedRequest->id)
                ->whereHas('related', function ($query) {
                    $query->where('status', '!=', 'done');
                })
                ->count();

            if ($otherIncompleteBlockersCount === 0) {
                $blockedRequest->update([
                    'is_blocked' => false,
                    'blocked_reason' => null,
                ]);

                $this->recordActivity(
                    $blockedRequest,
                    $actor,
                    'unblocked',
                    "Unblocked: Dependency #REQ-{$completedRequest->id} completed.",
                    ['dependency_id' => $completedRequest->id]
                );

                $this->notifyRelevantUsers(
                    $blockedRequest,
                    'unblocked',
                    "Unblocked: Dependency #REQ-{$completedRequest->id} completed.",
                    $actor
                );
            }
        }
    }
}
