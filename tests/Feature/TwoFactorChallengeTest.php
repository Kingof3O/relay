<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Models\Workspace;
use App\Services\TwoFactorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\User as SocialiteUserContract;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;
use Mockery;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorChallengeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Workspace $workspace;

    private TwoFactorService $twoFactorService;

    private string $secret;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::query()->firstOrCreate(['name' => 'Developer'], ['description' => 'Dev']);

        $this->twoFactorService = app(TwoFactorService::class);
        $this->secret = $this->twoFactorService->generateSecret();

        $this->user = User::query()->create([
            'name' => 'Security Tester',
            'username' => 'sectest',
            'email' => 'sec@relay.test',
            'password' => Hash::make('secret123'),
            'role_id' => $role->id,
            'active' => true,
            'two_factor_secret' => $this->secret,
            'two_factor_recovery_codes' => ['code-one-1234', 'code-two-5678'],
            'two_factor_confirmed_at' => now(),
        ]);

        $this->workspace = Workspace::query()->create([
            'name' => 'Sec Workspace',
            'slug' => 'sec-space',
            'owner_id' => $this->user->id,
        ]);
        $this->workspace->users()->attach($this->user->id, ['role_id' => $role->id]);
    }

    public function test_user_with_two_factor_enabled_is_redirected_to_two_factor_challenge_upon_login(): void
    {
        $response = $this->post(route('login'), [
            'username' => 'sectest',
            'password' => 'secret123',
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $this->assertGuest();
        $this->assertEquals($this->user->id, session('login.id'));
    }

    public function test_user_cannot_access_dashboard_before_completing_two_factor_challenge(): void
    {
        $this->post(route('login'), [
            'username' => 'sectest',
            'password' => 'secret123',
        ]);

        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_two_factor_challenge_page_redirects_to_login_if_no_session(): void
    {
        $response = $this->get(route('two-factor.login'));
        $response->assertRedirect(route('login'));
    }

    public function test_user_can_authenticate_with_valid_totp_code(): void
    {
        $google2fa = new Google2FA;
        $validCode = $google2fa->getCurrentOtp($this->secret);

        $response = $this->withSession(['login.id' => $this->user->id])
            ->post(route('two-factor.login.store'), [
                'code' => $validCode,
            ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($this->user);
        $this->assertNull(session('login.id'));
    }

    public function test_user_cannot_authenticate_with_invalid_totp_code(): void
    {
        $response = $this->withSession(['login.id' => $this->user->id])
            ->post(route('two-factor.login.store'), [
                'code' => '000000',
            ]);

        $response->assertSessionHasErrors(['code']);
        $this->assertGuest();
    }

    public function test_user_can_authenticate_with_recovery_code_and_code_is_consumed(): void
    {
        $response = $this->withSession(['login.id' => $this->user->id])
            ->post(route('two-factor.login.store'), [
                'recovery_code' => 'code-one-1234',
            ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($this->user);

        // Check single-use consumption
        $this->user->refresh();
        $this->assertEquals(['code-two-5678'], $this->user->two_factor_recovery_codes);

        // Logout and verify the consumed code can no longer be used
        auth()->logout();

        $responseSecond = $this->withSession(['login.id' => $this->user->id])
            ->post(route('two-factor.login.store'), [
                'recovery_code' => 'code-one-1234',
            ]);

        $responseSecond->assertSessionHasErrors(['recovery_code']);
        $this->assertGuest();
    }

    public function test_social_auth_redirects_to_two_factor_challenge_if_enabled(): void
    {
        $this->user->update(['github_id' => 'gh-12345']);

        $socialiteUser = Mockery::mock(SocialiteUserContract::class);
        $socialiteUser->shouldReceive('getId')->andReturn('gh-12345');
        $socialiteUser->shouldReceive('getEmail')->andReturn('sec@relay.test');
        $socialiteUser->shouldReceive('getName')->andReturn('Security Tester');
        $socialiteUser->shouldReceive('getNickname')->andReturn('sectest');

        $providerMock = Mockery::mock(AbstractProvider::class);
        $providerMock->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('github')->andReturn($providerMock);

        config(['services.github.client_id' => 'fake', 'services.github.client_secret' => 'fake']);

        $response = $this->get(route('auth.social.callback', ['provider' => 'github']));

        $response->assertRedirect(route('two-factor.login'));
        $this->assertGuest();
        $this->assertEquals($this->user->id, session('login.id'));
    }
}
