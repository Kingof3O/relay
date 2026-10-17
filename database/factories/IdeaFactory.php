<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\IdeaStatus;
use App\Models\Idea;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Idea>
 */
final class IdeaFactory extends Factory
{
    protected $model = Idea::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(IdeaStatus::values());

        return [
            'title' => $this->faker->sentence(6),
            'content' => $this->faker->paragraphs(asText: true),
            'status' => $status,
            'progress' => $this->faker->numberBetween(0, 100),
            'last_reply_at' => $this->faker->optional()->dateTimeBetween('-60 days', 'now'),
            // project_id / created_by set by seeder
            'assigned_to' => null,
            'last_updated_by' => null,
        ];
    }
}
