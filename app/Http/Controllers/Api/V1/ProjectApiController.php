<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AreaResource;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ProjectApiController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $activeWorkspace = $user?->currentWorkspace() ?? $user?->workspaces()->first();

        if (! $activeWorkspace) {
            return AreaResource::collection(collect());
        }

        $projects = Area::query()
            ->where('workspace_id', $activeWorkspace->id)
            ->whereNull('archived_at')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return AreaResource::collection($projects);
    }
}
