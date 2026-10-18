<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Services\SocialAuthService;
use Database\Seeders\IndependentWorkspaceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

final class OAuthProviderToggleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $designer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(IndependentWorkspaceSeeder::class);

        $this->admin = User::query()->where('username', 'robin')->firstOrFail();
        $this->designer = User::query()->where('username', 'designer-1')->firstOrFail();

        // Clear any leftover overrides
        SocialAuthService::clearOverride('github');
        SocialAuthService::clearOverride('google');
    }

    protected function tearDown(): void
    {
        SocialAuthService::clearOverride('github');
        SocialAuthService::clearOverride('google');
        parent::tearDown();
    }

    public function test_login_page_receives_social_providers_status(): void
    {
        $response = $this->get(route('login'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')
            ->has('socialProviders')
            ->has('socialProviders.github')
            ->has('socialProviders.google')
        );
    }

    public function test_disabling_github_via_service_hides_it_from_login_page(): void
    {
        SocialAuthService::setEnabled('github', false);
        SocialAuthService::setEnabled('google', true);

        $response = $this->get(route('login'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')
            ->where('socialProviders.github', false)
            ->where('socialProviders.google', true)
        );
    }

    public function test_disabling_github_blocks_redirect_and_callback(): void
    {
        SocialAuthService::setEnabled('github', false);

        $redirectRes = $this->get(route('auth.social.redirect', ['provider' => 'github']));
        $redirectRes->assertNotFound();

        $callbackRes = $this->get(route('auth.social.callback', ['provider' => 'github']));
        $callbackRes->assertNotFound();
    }

    public function test_disabling_google_blocks_redirect_and_callback(): void
    {
        SocialAuthService::setEnabled('google', false);

        $redirectRes = $this->get(route('auth.social.redirect', ['provider' => 'google']));
        $redirectRes->assertNotFound();

        $callbackRes = $this->get(route('auth.social.callback', ['provider' => 'google']));
        $callbackRes->assertNotFound();
    }

    public function test_disabling_both_providers_marks_both_false_in_login_props(): void
    {
        SocialAuthService::setEnabled('github', false);
        SocialAuthService::setEnabled('google', false);

        $response = $this->get(route('login'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')
            ->where('socialProviders.github', false)
            ->where('socialProviders.google', false)
        );
    }

    public function test_admin_can_toggle_provider_via_settings_api(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson(route('settings.oauth.toggle'), [
                'provider' => 'github',
                'enabled' => false,
            ]);

        $response->assertOk()
            ->assertJsonPath('oauthProviders.github.enabled', false);

        $this->assertFalse(SocialAuthService::isEnabled('github'));

        // Verify audit log
        $this->assertDatabaseHas('workspace_audits', [
            'user_id' => $this->admin->id,
            'event' => 'oauth_provider.disabled',
        ]);

        // Re-enable
        $enableResponse = $this->actingAs($this->admin)
            ->postJson(route('settings.oauth.toggle'), [
                'provider' => 'github',
                'enabled' => true,
            ]);

        $enableResponse->assertOk()
            ->assertJsonPath('oauthProviders.github.enabled', true);

        $this->assertTrue(SocialAuthService::isEnabled('github'));

        $this->assertDatabaseHas('workspace_audits', [
            'user_id' => $this->admin->id,
            'event' => 'oauth_provider.enabled',
        ]);
    }

    public function test_non_admin_cannot_toggle_oauth_provider(): void
    {
        $response = $this->actingAs($this->designer)
            ->postJson(route('settings.oauth.toggle'), [
                'provider' => 'github',
                'enabled' => false,
            ]);

        $response->assertForbidden();
    }

    public function test_artisan_oauth_command_toggles_provider(): void
    {
        $this->artisan('relay:oauth', ['provider' => 'github', '--disable' => true])
            ->assertSuccessful();

        $this->assertFalse(SocialAuthService::isEnabled('github'));

        $this->artisan('relay:oauth', ['provider' => 'github', '--enable' => true])
            ->assertSuccessful();

        $this->assertTrue(SocialAuthService::isEnabled('github'));

        $this->artisan('relay:oauth', ['provider' => 'github', '--reset' => true])
            ->assertSuccessful();

        $this->artisan('relay:oauth', ['--status' => true])
            ->assertSuccessful();
    }

    public function test_env_config_explicitly_disables_provider(): void
    {
        SocialAuthService::clearOverride('github');

        config(['services.github.enabled' => false]);
        $this->assertFalse(SocialAuthService::isEnabled('github'));

        config(['services.github.enabled' => true]);
        config(['services.github.client_id' => 'mock-client-id']);
        $this->assertTrue(SocialAuthService::isEnabled('github'));
    }
}
