<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Services\TwoFactorService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider as SocialiteProvider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

final class TwoFactorAndOAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);
    }

    public function test_two_factor_enable_generates_secret_qr_svg_and_recovery_codes(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($user)->postJson(route('two-factor.enable'));

        $response->assertOk()
            ->assertJsonStructure([
                'status',
                'secret',
                'qr_svg',
                'recovery_codes',
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['secret']);
        $this->assertStringContainsString('<svg', $data['qr_svg']);
        $this->assertCount(8, $data['recovery_codes']);

        $user->refresh();
        $this->assertNotNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_confirmed_at);
        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    public function test_two_factor_confirm_rejects_invalid_code(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        // Enable first
        $this->actingAs($user)->postJson(route('two-factor.enable'));

        $response = $this->actingAs($user)->postJson(route('two-factor.confirm'), [
            'code' => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['code']);

        $user->refresh();
        $this->assertNull($user->two_factor_confirmed_at);
        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    public function test_two_factor_confirm_accepts_valid_totp_code_and_enables_two_factor(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $enableResponse = $this->actingAs($user)->postJson(route('two-factor.enable'));
        $secret = $enableResponse->json('secret');

        $google2fa = new Google2FA();
        $validCode = $google2fa->getCurrentOtp($secret);

        $confirmResponse = $this->actingAs($user)->postJson(route('two-factor.confirm'), [
            'code' => $validCode,
        ]);

        $confirmResponse->assertOk()
            ->assertJson([
                'status' => 'confirmed',
            ]);

        $user->refresh();
        $this->assertNotNull($user->two_factor_confirmed_at);
        $this->assertTrue($user->hasTwoFactorEnabled());
    }

    public function test_two_factor_disable_clears_secret_and_recovery_codes(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $enableResponse = $this->actingAs($user)->postJson(route('two-factor.enable'));
        $secret = $enableResponse->json('secret');

        $validCode = (new Google2FA())->getCurrentOtp($secret);
        $this->actingAs($user)->postJson(route('two-factor.confirm'), ['code' => $validCode]);

        $user->refresh();
        $this->assertTrue($user->hasTwoFactorEnabled());

        $disableResponse = $this->actingAs($user)->deleteJson(route('two-factor.disable'));
        $disableResponse->assertOk()
            ->assertJson(['status' => 'disabled']);

        $user->refresh();
        $this->assertNull($user->two_factor_secret);
        $this->assertNull($user->two_factor_recovery_codes);
        $this->assertNull($user->two_factor_confirmed_at);
        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    public function test_regenerating_recovery_codes_requires_enabled_two_factor(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();

        $response = $this->actingAs($user)->postJson(route('two-factor.recovery-codes'));
        $response->assertStatus(422);

        // Now enable 2FA
        $enableResponse = $this->actingAs($user)->postJson(route('two-factor.enable'));
        $secret = $enableResponse->json('secret');
        $validCode = (new Google2FA())->getCurrentOtp($secret);
        $this->actingAs($user)->postJson(route('two-factor.confirm'), ['code' => $validCode]);

        $regenResponse = $this->actingAs($user)->postJson(route('two-factor.recovery-codes'));
        $regenResponse->assertOk()
            ->assertJsonStructure(['status', 'recovery_codes']);

        $newCodes = $regenResponse->json('recovery_codes');
        $this->assertCount(8, $newCodes);

        $user->refresh();
        $this->assertEquals($newCodes, $user->two_factor_recovery_codes);
    }

    public function test_social_auth_redirect_routes_to_provider(): void
    {
        config(['services.github.client_id' => 'gh-client-id']);
        config(['services.github.client_secret' => 'gh-client-secret']);
        config(['services.github.redirect' => 'http://localhost/auth/github/callback']);

        $response = $this->get(route('auth.social.redirect', ['provider' => 'github']));
        $response->assertRedirect();
        $this->assertStringContainsString('github.com/login/oauth/authorize', (string) $response->headers->get('Location'));
    }

    public function test_social_auth_rejects_unsupported_provider(): void
    {
        $response = $this->get(route('auth.social.redirect', ['provider' => 'facebook']));
        $response->assertNotFound();
    }

    public function test_social_auth_callback_links_existing_user_by_email(): void
    {
        $user = User::query()->where('username', 'robin')->firstOrFail();
        $this->assertNull($user->github_id);

        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn('987654321');
        $socialiteUser->shouldReceive('getEmail')->andReturn($user->email);
        $socialiteUser->shouldReceive('getName')->andReturn('Robin The Owner');
        $socialiteUser->shouldReceive('getNickname')->andReturn('robin-gh');

        $provider = Mockery::mock(SocialiteProvider::class);
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('github')->andReturn($provider);

        $response = $this->get(route('auth.social.callback', ['provider' => 'github']));

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);

        $user->refresh();
        $this->assertEquals('987654321', $user->github_id);
    }

    public function test_social_auth_callback_creates_and_authenticates_new_user(): void
    {
        $newEmail = 'new-engineer@google.com';
        $googleId = 'google-sub-1122334455';

        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn($googleId);
        $socialiteUser->shouldReceive('getEmail')->andReturn($newEmail);
        $socialiteUser->shouldReceive('getName')->andReturn('Alex Mercer');
        $socialiteUser->shouldReceive('getNickname')->andReturn('alexm');

        $provider = Mockery::mock(SocialiteProvider::class);
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get(route('auth.social.callback', ['provider' => 'google']));

        $response->assertRedirect(route('dashboard'));

        $newUser = User::query()->where('google_id', $googleId)->firstOrFail();
        $this->assertEquals($newEmail, $newUser->email);
        $this->assertTrue($newUser->active);
        $this->assertNotNull($newUser->role_id);
        $this->assertAuthenticatedAs($newUser);
    }
}
