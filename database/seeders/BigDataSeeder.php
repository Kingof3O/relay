<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\IdeaStatus;
use App\Models\FollowUp;
use App\Models\Idea;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

final class BigDataSeeder extends Seeder
{
    public function run(): void
    {
        $projectsCount = (int) env('STM_BIG_PROJECTS', 50);
        $ideasPerProject = (int) env('STM_BIG_IDEAS_PER_PROJECT', 20);
        $followUpsPerIdea = (int) env('STM_BIG_FOLLOWUPS_PER_IDEA', 12);
        $tasksPerIdea = (int) env('STM_BIG_TASKS_PER_IDEA', 8);
        $teamMembersCount = (int) env('STM_BIG_TEAM_MEMBERS', 25);

        $owner = User::query()->where('username', (string) env('STM_OWNER_USERNAME', 'robin'))->first();
        $mainDev = User::query()->where('username', (string) env('STM_MAIN_DEV_USERNAME', 'main-dev'))->first();

        if ($owner === null || $mainDev === null) {
            $this->command?->warn('Owner/Main Dev users not found. Run RolesAndPermissionsSeeder first.');
            return;
        }

        $teamMemberRole = Role::query()->where('name', 'Team Member')->first();

        if ($teamMemberRole === null) {
            $this->command?->warn('Team Member role not found. Run RolesAndPermissionsSeeder first.');
            return;
        }

        $this->command?->info('Seeding big demo data...');

        $teamMembers = User::factory()
            ->count($teamMembersCount)
            ->create([
                'role_id' => $teamMemberRole->id,
                'active' => true,
            ]);

        $allActors = collect([$owner, $mainDev])->merge($teamMembers)->values();
        $privilegedActors = collect([$owner, $mainDev])->values();

        DB::transaction(function () use (
            $projectsCount,
            $ideasPerProject,
            $followUpsPerIdea,
            $tasksPerIdea,
            $allActors,
            $privilegedActors,
            $teamMembers,
            $owner
        ): void {
            $projects = Project::factory()
                ->count($projectsCount)
                ->create([
                    'owner_id' => $owner->id,
                    'created_by' => $privilegedActors->random()->id,
                ]);

            foreach ($projects as $project) {
                $ideas = Idea::factory()
                    ->count($ideasPerProject)
                    ->create([
                        'project_id' => $project->id,
                        'created_by' => $privilegedActors->random()->id,
                    ]);

                foreach ($ideas as $idea) {
                    $assignee = $teamMembers->isNotEmpty() && random_int(0, 100) < 70
                        ? $teamMembers->random()
                        : null;

                    $idea->assigned_to = $assignee?->id;
                    $idea->last_updated_by = $allActors->random()->id;
                    $idea->status = IdeaStatus::from($idea->status->value);
                    $idea->save();

                    Task::factory()
                        ->count($tasksPerIdea)
                        ->create([
                            'idea_id' => $idea->id,
                            'created_by' => $allActors->random()->id,
                        ])
                        ->each(function (Task $task) use ($allActors): void {
                            if (! $task->is_done) {
                                return;
                            }

                            $task->completed_by = $allActors->random()->id;
                            $task->completed_at = now();
                            $task->save();
                        });

                    $followUps = collect();

                    for ($i = 0; $i < $followUpsPerIdea; $i++) {
                        $parentId = null;

                        if ($followUps->isNotEmpty() && random_int(0, 100) < 35) {
                            $parentId = $followUps->random()->id;
                        }

                        /** @var FollowUp $followUp */
                        $followUp = FollowUp::factory()->create([
                            'idea_id' => $idea->id,
                            'user_id' => $allActors->random()->id,
                            'parent_id' => $parentId,
                            'status_at_time' => $idea->status->value,
                        ]);

                        $followUps->push($followUp);
                    }
                }
            }
        });

        $this->command?->info('Big demo data seeding complete.');
    }
}
