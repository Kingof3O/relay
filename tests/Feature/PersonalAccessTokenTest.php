<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class PersonalAccessTokenTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->user = User::query()->where('username', 'robin')->firstOrFail();
        $this->otherUser = User::query()->where('username', 'hussien')->firstOrFail();
    }

    public function test_pat_endpoints_require_authentication(): void
    {
        $this->getJson('/tokens')->assertUnauthorized();
        $this->postJson('/tokens', ['name' => 'CLI Token'])->assertUnauthorized();
        $this->deleteJson('/tokens/1')->assertUnauthorized();
    }

    public function test_generating_token_with_abilities_and_expiration(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/tokens', [
                'name' => 'CI Deployment Token',
                'abilities' => ['read:requests', 'write:requests'],
                'expires_at' => now()->addDays(30)->toIso8601String(),
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'token',
                'plainTextToken',
                'accessToken' => [
                    'id',
                    'name',
                    'abilities',
                ],
            ]);

        $this->assertDatabaseHas('personal_access_tokens', [
            'name' => 'CI Deployment Token',
            'tokenable_id' => $this->user->id,
            'tokenable_type' => $this->user->getMorphClass(),
        ]);

        $created = $this->user->tokens()->where('name', 'CI Deployment Token')->first();
        $this->assertNotNull($created);
        $this->assertEquals(['read:requests', 'write:requests'], $created->abilities);
        $this->assertNotNull($created->expires_at);
    }

    public function test_listing_personal_access_tokens(): void
    {
        $this->user->createToken('Token Alpha', ['*']);
        $this->user->createToken('Token Beta', ['read:requests']);

        $response = $this->actingAs($this->user)
            ->getJson('/tokens');

        $response->assertOk()
            ->assertJsonStructure([
                'tokens' => [
                    '*' => [
                        'id',
                        'name',
                        'abilities',
                        'last_used_at',
                        'expires_at',
                        'created_at',
                    ],
                ],
            ]);

        $names = collect($response->json('tokens'))->pluck('name');
        $this->assertTrue($names->contains('Token Alpha'));
        $this->assertTrue($names->contains('Token Beta'));
    }

    public function test_revoking_personal_access_token(): void
    {
        $token = $this->user->createToken('Revoke Me Token');

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $token->accessToken->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/tokens/{$token->accessToken->id}");

        $response->assertOk()
            ->assertJsonPath('deleted', true);

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->accessToken->id]);
    }

    public function test_cannot_revoke_another_users_token(): void
    {
        $otherToken = $this->otherUser->createToken('Other User Token');

        $response = $this->actingAs($this->user)
            ->deleteJson("/tokens/{$otherToken->accessToken->id}");

        $response->assertStatus(404);

        $this->assertDatabaseHas('personal_access_tokens', ['id' => $otherToken->accessToken->id]);
    }

    public function test_generated_token_can_authenticate_api_requests(): void
    {
        $res = $this->actingAs($this->user)->postJson('/tokens', [
            'name' => 'API Test Token',
            'abilities' => ['*'],
        ]);

        $plainTextToken = $res->json('token');

        $apiRes = $this->withHeader('Authorization', 'Bearer '.$plainTextToken)
            ->getJson('/api/v1/projects');

        $apiRes->assertOk();
    }
}
