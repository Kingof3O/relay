<?php

namespace App\Http\Controllers;

use App\Models\WorkRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RequestCloneController extends Controller
{
    public function store(Request $request, ?WorkRequest $workRequest = null): RedirectResponse
    {
        if (! $workRequest) {
            $bound = $request->route('workRequest') ?? $request->route('request');
            $workRequest = $bound instanceof WorkRequest ? $bound : WorkRequest::findOrFail($bound);
        }

        $user = $request->user();

        $this->authorize('view', $workRequest);
        $this->authorize('create', WorkRequest::class);

        $newRequest = DB::transaction(function () use ($workRequest, $user): WorkRequest {
            $data = [
                'workspace_id' => $workRequest->workspace_id,
                'title' => "[Copy] {$workRequest->title}",
                'description' => $workRequest->description,
                'area_id' => $workRequest->area_id,
                'priority' => $workRequest->priority,
                'status' => 'new',
                'story_points' => $workRequest->story_points,
                'cycle_id' => $workRequest->cycle_id,
                'requester_id' => $user->id,
                'assignee_id' => $workRequest->assignee_id,
                'is_blocked' => false,
                'blocked_reason' => null,
            ];

            if (Schema::hasColumn('requests', 'tags') && isset($workRequest->tags)) {
                $data['tags'] = $workRequest->tags;
            }

            $cloned = WorkRequest::query()->create($data);

            $cloned->activities()->create([
                'user_id' => $user->id,
                'type' => 'created',
                'body' => "Duplicated from #REQ-{$workRequest->id}",
            ]);

            return $cloned;
        });

        return redirect()->route('requests.show', $newRequest->id);
    }
}
