<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\RequestActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class AgentHubController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $workspace = $user?->currentWorkspace() ?? $user?->workspaces()->first();
        $workspaceId = $workspace?->id;

        $serverUrl = rtrim(config('app.url') ?: $request->getSchemeAndHttpHost(), '/');
        $mcpBinaryPath = base_path('mcp-server/dist/index.js');

        // Agent activity query: activities where type is agent_action, or metadata contains is_agent or source=mcp
        $agentActivities = RequestActivity::query()
            ->when($workspaceId, fn ($q) => $q->whereHas('request', fn ($rq) => $rq->where('workspace_id', $workspaceId)))
            ->when(! $workspaceId, fn ($q) => $q->whereHas('request', fn ($rq) => $rq->where(fn ($sq) => $sq->where('requester_id', $user?->id)->orWhere('assignee_id', $user?->id)->orWhereNull('workspace_id'))))
            ->where(function ($query): void {
                $query->where('type', 'agent_action')
                    ->orWhere('metadata->is_agent', true)
                    ->orWhere('metadata->source', 'mcp');
            })
            ->with(['request:id,title,status,priority,workspace_id', 'user:id,name,username'])
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(function (RequestActivity $activity): array {
                return [
                    'id' => $activity->id,
                    'request_id' => $activity->request_id,
                    'request_title' => $activity->request?->title ?? "Request #{$activity->request_id}",
                    'request_status' => $activity->request?->status?->value ?? (string) $activity->request?->getRawOriginal('status'),
                    'request_priority' => $activity->request?->priority?->value ?? (string) $activity->request?->getRawOriginal('priority'),
                    'type' => $activity->type,
                    'body' => $activity->body,
                    'metadata' => $activity->metadata,
                    'tool' => $activity->metadata['tool'] ?? null,
                    'token_name' => $activity->metadata['token_name'] ?? null,
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'username' => $activity->user->username,
                    ] : null,
                    'created_at' => $activity->created_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();

        // Active personal access tokens for the user
        $tokens = $user?->tokens()
            ->latest('created_at')
            ->get(['id', 'name', 'abilities', 'last_used_at', 'expires_at', 'created_at'])
            ->map(fn ($token): array => [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities ?? ['*'],
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
                'created_at' => $token->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        // Standard tool specifications for documentation & UI explorer
        $tools = [
            [
                'name' => 'relay_get_daily_briefing',
                'title' => 'Daily Briefing (Catch-Up)',
                'description' => 'Fetches the morning briefing for Relay Studio. Returns active sprint progress, urgent blockers, newly submitted tickets in the last 24h, tasks assigned to you, and recent notifications.',
                'parameters' => [
                    ['name' => 'since_hours', 'type' => 'number', 'required' => false, 'default' => '24', 'description' => 'Hours to look back for newly created requests (max: 168).'],
                ],
                'example' => 'relay_get_daily_briefing({"since_hours": 24})',
            ],
            [
                'name' => 'relay_list_tasks',
                'title' => 'List & Filter Tasks',
                'description' => 'Lists or searches work requests in Relay Studio. Filter by status (new, ready, doing, review, done), priority (urgent, normal, low), or project ID.',
                'parameters' => [
                    ['name' => 'status', 'type' => 'string', 'required' => false, 'description' => 'Filter by stage: new, ready, doing, review, done, cancelled.'],
                    ['name' => 'priority', 'type' => 'string', 'required' => false, 'description' => 'Filter by priority: urgent, normal, low.'],
                    ['name' => 'area_id', 'type' => 'number', 'required' => false, 'description' => 'Filter by Project / Area ID.'],
                    ['name' => 'per_page', 'type' => 'number', 'required' => false, 'default' => '25', 'description' => 'Results per page (max: 100).'],
                ],
                'example' => 'relay_list_tasks({"status": "doing", "priority": "urgent"})',
            ],
            [
                'name' => 'relay_get_task',
                'title' => 'Get Task Details',
                'description' => 'Retrieves complete details of a specific task by ID from Relay Studio, including description, assignee, priority, status, subtasks, and relations.',
                'parameters' => [
                    ['name' => 'id', 'type' => 'number', 'required' => true, 'description' => 'The numeric ID of the work request.'],
                ],
                'example' => 'relay_get_task({"id": 142})',
            ],
            [
                'name' => 'relay_create_task',
                'title' => 'Create Task',
                'description' => 'Creates a new work request / task in Relay Studio under a specific project.',
                'parameters' => [
                    ['name' => 'title', 'type' => 'string', 'required' => true, 'description' => 'Title of the task.'],
                    ['name' => 'area_id', 'type' => 'number', 'required' => true, 'description' => 'Project / Area ID under which this task is created.'],
                    ['name' => 'priority', 'type' => 'string', 'required' => false, 'default' => 'normal', 'description' => 'Priority: urgent, normal, low.'],
                    ['name' => 'description', 'type' => 'string', 'required' => false, 'description' => 'Markdown description of the task.'],
                    ['name' => 'status', 'type' => 'string', 'required' => false, 'default' => 'new', 'description' => 'Initial stage: new, ready, doing, review, done.'],
                    ['name' => 'story_points', 'type' => 'number', 'required' => false, 'description' => 'Story point estimate.'],
                    ['name' => 'assignee_id', 'type' => 'number', 'required' => false, 'description' => 'User ID to assign this task to.'],
                ],
                'example' => 'relay_create_task({"title": "Refactor auth middleware", "area_id": 1, "priority": "urgent", "story_points": 5})',
            ],
            [
                'name' => 'relay_update_task',
                'title' => 'Update Task & Move Stages',
                'description' => 'Updates a task in Relay Studio (e.g. moving a card to "doing" when starting work, "review" when finished, or modifying priority/description/blocker state).',
                'parameters' => [
                    ['name' => 'id', 'type' => 'number', 'required' => true, 'description' => 'The numeric ID of the task to update.'],
                    ['name' => 'status', 'type' => 'string', 'required' => false, 'description' => 'New status: new, ready, doing, review, done, cancelled.'],
                    ['name' => 'priority', 'type' => 'string', 'required' => false, 'description' => 'Priority: urgent, normal, low.'],
                    ['name' => 'title', 'type' => 'string', 'required' => false, 'description' => 'Updated title.'],
                    ['name' => 'description', 'type' => 'string', 'required' => false, 'description' => 'Updated markdown description.'],
                    ['name' => 'is_blocked', 'type' => 'boolean', 'required' => false, 'description' => 'Mark whether this task is currently blocked.'],
                    ['name' => 'blocked_reason', 'type' => 'string', 'required' => false, 'description' => 'Reason why the task is blocked.'],
                ],
                'example' => 'relay_update_task({"id": 142, "status": "doing"})',
            ],
            [
                'name' => 'relay_add_comment',
                'title' => 'Add Comment & Log Progress',
                'description' => 'Adds a progress note, explanation, or review comment to a task in Relay Studio. Supports @mentions which notify team members.',
                'parameters' => [
                    ['name' => 'task_id', 'type' => 'number', 'required' => true, 'description' => 'The numeric ID of the work request.'],
                    ['name' => 'body', 'type' => 'string', 'required' => true, 'description' => 'The comment text (Markdown supported).'],
                ],
                'example' => 'relay_add_comment({"task_id": 142, "body": "Implemented unit tests for auth refresh tokens."})',
            ],
            [
                'name' => 'relay_list_comments',
                'title' => 'List Comments & Discussion',
                'description' => 'Retrieves the discussion and comment history for a specific task in Relay Studio.',
                'parameters' => [
                    ['name' => 'task_id', 'type' => 'number', 'required' => true, 'description' => 'The numeric ID of the work request.'],
                ],
                'example' => 'relay_list_comments({"task_id": 142})',
            ],
        ];

        return Inertia::render('Agents/Index', [
            'workspace' => $workspace ? [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
            ] : null,
            'serverUrl' => $serverUrl,
            'mcpBinaryPath' => $mcpBinaryPath,
            'tools' => $tools,
            'agentActivities' => $agentActivities,
            'tokens' => $tokens,
        ]);
    }
}
