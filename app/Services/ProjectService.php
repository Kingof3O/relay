<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\ProjectStatus;
use App\Models\Project;
use App\Models\User;

final class ProjectService
{
    /**
     * @param array<string, mixed> $validated
     */
    public function create(User $actor, array $validated): Project
    {
        $owner = $this->resolveOwnerUser($actor);

        $project = new Project();
        $project->fill($validated);

        if (! array_key_exists('status', $validated) || $validated['status'] === null || $validated['status'] === '') {
            $project->status = ProjectStatus::Planning;
        }

        $project->owner_id = $owner->id;
        $project->created_by = $actor->id;
        $project->save();

        return $project;
    }

    /**
     * @param array<string, mixed> $validated
     */
    public function update(Project $project, array $validated): Project
    {
        $project->fill($validated);

        if (array_key_exists('status', $validated) && ($validated['status'] === null || $validated['status'] === '')) {
            $project->status = ProjectStatus::Planning;
        }

        $project->save();

        return $project;
    }

    private function resolveOwnerUser(User $fallback): User
    {
        $ownerUsername = (string) env('STM_OWNER_USERNAME', 'robin');

        $owner = User::query()->where('username', $ownerUsername)->first();

        if ($owner !== null) {
            return $owner;
        }

        $owner = User::query()
            ->whereHas('role', static function ($query): void {
                $query->where('name', 'Owner');
            })
            ->first();

        return $owner ?? $fallback;
    }
}
