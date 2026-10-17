<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->create(['name' => 'Tester'])->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create([
            'role_id' => Role::query()->create(['name' => 'Tester'])->id,
        ]);

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'username' => 'test-user',
                'email' => 'test-user@example.test',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test-user', $user->username);
        $this->assertSame('test-user@example.test', $user->email);
    }

    public function test_profile_email_must_be_valid_and_unique(): void
    {
        $role = Role::query()->create(['name' => 'Tester']);
        $user = User::factory()->create([
            'role_id' => $role->id,
            'email' => 'first@example.test',
        ]);
        User::factory()->create([
            'role_id' => $role->id,
            'email' => 'taken@example.test',
        ]);

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->patch('/profile', [
                'name' => $user->name,
                'username' => $user->username,
                'email' => 'taken@example.test',
            ]);

        $response->assertSessionHasErrors('email');

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->patch('/profile', [
                'name' => $user->name,
                'username' => $user->username,
                'email' => 'not-an-email',
            ]);

        $response->assertSessionHasErrors('email');
    }
}
