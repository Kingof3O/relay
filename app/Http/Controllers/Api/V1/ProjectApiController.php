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
        $activeWorkspace = $request->user()?->currentWorkspace();

        $projects = Area::query()
            ->whereNull('archived_at')
            ->when($activeWorkspace, fn ($q) => $q->where(fn ($sub) => $sub->where('workspace_id', $activeWorkspace->id)->orWhereNull('workspace_id')))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return AreaResource::collection($projects);
    }
}
