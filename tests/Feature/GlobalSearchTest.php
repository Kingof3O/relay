<?php

namespace Tests\Feature;

use App\Models\Area;
use App\Models\User;
use App\Models\WorkRequest;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class GlobalSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_global_search_returns_matched_requests_and_projects(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $area = Area::query()->firstOrCreate(
            ['name' => 'Mobile App Platform'],
            ['slug' => 'mobile-app', 'color' => '#8b5cf6']
        );

        $request = WorkRequest::query()->create([
            'area_id' => $area->id,
            'title' => 'Implement biometric login authentication',
            'description' => 'Support FaceID and fingerprint credentials.',
            'status' => 'doing',
            'priority' => 'urgent',
            'requester_id' => $user->id,
            'assignee_id' => null,
        ]);

        // Search by keyword in title
        $response = $this->actingAs($user)->getJson('/api/search?q=biometric');
        $response->assertOk();
        $response->assertJsonStructure([
            'requests' => [
                '*' => ['id', 'title', 'status', 'priority', 'project'],
            ],
            'projects',
        ]);
        $data = $response->json();
        $this->assertCount(1, $data['requests']);
        $this->assertEquals($request->id, $data['requests'][0]['id']);

        // Search by project name
        $projResponse = $this->actingAs($user)->getJson('/api/search?q=Mobile');
        $projResponse->assertOk();
        $projData = $projResponse->json();
        $this->assertNotEmpty($projData['projects']);
        $this->assertEquals($area->id, $projData['projects'][0]['id']);

        // Search by ticket ID directly (#REQ-ID)
        $idResponse = $this->actingAs($user)->getJson('/api/search?q=REQ-'.$request->id);
        $idResponse->assertOk();
        $idData = $idResponse->json();
        $this->assertCount(1, $idData['requests']);
        $this->assertEquals($request->id, $idData['requests'][0]['id']);

        // Search by numeric ID with hashtag (#ID)
        $hashResponse = $this->actingAs($user)->getJson('/search?q='.urlencode('#'.$request->id));
        $hashResponse->assertOk();
        $hashData = $hashResponse->json();
        $this->assertCount(1, $hashData['requests']);
        $this->assertEquals($request->id, $hashData['requests'][0]['id']);
    }

    public function test_web_search_route_requires_authentication(): void
    {
        $response = $this->getJson('/search?q=test');
        $response->assertUnauthorized();
    }

    public function test_global_search_returns_empty_results_when_query_is_blank(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($user)->getJson('/search?q=');
        $response->assertOk();
        $response->assertJson([
            'requests' => [],
            'projects' => [],
        ]);
    }
}
