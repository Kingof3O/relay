<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\IdeaStatus;
use App\Models\FollowUp;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FollowUp>
 */
final class FollowUpFactory extends Factory
{
    protected $model = FollowUp::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => $this->faker->paragraphs(asText: true),
            'status_at_time' => $this->faker->randomElement(IdeaStatus::values()),
            // idea_id / user_id / parent_id set by seeder
            'parent_id' => null,
        ];
    }
}
