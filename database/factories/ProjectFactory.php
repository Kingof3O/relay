<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
final class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company().' '.$this->faker->word(),
            'description' => $this->faker->optional()->paragraphs(asText: true),
            'status' => $this->faker->randomElement(ProjectStatus::values()),
            // owner_id / created_by set by seeder
        ];
    }
}
