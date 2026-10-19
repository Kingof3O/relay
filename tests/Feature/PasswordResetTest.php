<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::query()->firstOrCreate(['name' => 'Developer'], ['description' => 'Dev']);

        $this->user = User::query()->create([
            'name' => 'Reset Tester',
            'username' => 'resetuser',
            'email' => 'reset@relay.test',
            'password' => Hash::make('oldpassword123'),
            'role_id' => $role->id,
            'active' => true,
        ]);
    }

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $response = $this->get(route('password.request'));

        $response->assertStatus(200);
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $response = $this->post(route('password.email'), [
            'email' => 'reset@relay.test',
        ]);

        $response->assertSessionHas('status');

        Notification::assertSentTo(
            $this->user,
            ResetPassword::class
        );
    }

    public function test_reset_password_screen_can_be_rendered(): void
    {
        Notification::fake();

        $this->post(route('password.email'), [
            'email' => 'reset@relay.test',
        ]);

        Notification::assertSentTo(
            $this->user,
            ResetPassword::class,
            function (ResetPassword $notification) {
                $response = $this->get(route('password.reset', ['token' => $notification->token]));
                $response->assertStatus(200);

                return true;
            }
        );
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        $token = Password::broker()->createToken($this->user);

        $response = $this->post(route('password.store'), [
            'token' => $token,
            'email' => 'reset@relay.test',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('login'));

        $this->user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $this->user->password));
    }

    public function test_password_cannot_be_reset_with_invalid_token(): void
    {
        $response = $this->post(route('password.store'), [
            'token' => 'invalid-token-12345',
            'email' => 'reset@relay.test',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertSessionHasErrors('email');

        $this->user->refresh();
        $this->assertTrue(Hash::check('oldpassword123', $this->user->password));
    }
}
