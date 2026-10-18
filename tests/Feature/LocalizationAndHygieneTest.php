<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocalizationAndHygieneTest extends TestCase
{
    /**
     * Test language files are loaded and contain required translation entries.
     */
    public function test_language_files_exist_and_load_correctly(): void
    {
        $statusLang = lang_path('en/status.php');
        $workspaceLang = lang_path('en/workspace.php');

        $this->assertFileExists($statusLang);
        $this->assertFileExists($workspaceLang);

        $this->assertSame('Done', trans('status.statuses.done'));
        $this->assertSame('Urgent', trans('status.priorities.urgent'));
        $this->assertSame('Relay Studio', trans('workspace.title'));
        $this->assertSame('Dashboard', trans('workspace.navigation.dashboard'));
    }

    /**
     * Test Inertia shares i18n translations dictionary and locale.
     */
    public function test_inertia_shares_i18n_dictionary_in_page_props(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) => $page
            ->has('translations')
            ->has('translations.status.statuses')
            ->where('translations.status.statuses.done', 'Done')
            ->where('translations.workspace.title', 'Relay Studio')
            ->where('locale', 'en')
            ->has('i18n.translations.status')
            ->has('i18n.translations.workspace')
        );
    }

    /**
     * Test relay:doctor command executes successfully with green status.
     */
    public function test_relay_doctor_command_runs_green(): void
    {
        $this->artisan('relay:doctor')
            ->assertSuccessful()
            ->expectsOutputToContain('RELAY STUDIO SYSTEM & DEPLOYMENT DOCTOR')
            ->expectsOutputToContain('All critical environment diagnostics passed! Relay Studio is deployment-ready.');
    }

    /**
     * Test root hygiene: master prompt removed and screenshots relocated.
     */
    public function test_repository_root_hygiene_and_assets(): void
    {
        $this->assertFileDoesNotExist(base_path('project'));

        $this->assertFileExists(base_path('docs/assets/c1-sidebar.png'));
        $this->assertFileExists(base_path('docs/assets/v3-ideas.png'));
        $this->assertFileExists(base_path('CODE_OF_CONDUCT.md'));

        $codeOfConduct = file_get_contents(base_path('CODE_OF_CONDUCT.md'));
        $this->assertStringContainsString('Contributor Covenant Code of Conduct', $codeOfConduct);
        $this->assertStringContainsString('security@relay.studio', $codeOfConduct);
    }

    /**
     * Test composer.json and .gitignore configuration compliance.
     */
    public function test_composer_and_gitignore_configuration(): void
    {
        $gitignore = file_get_contents(base_path('.gitignore'));
        $this->assertStringContainsString('.DS_Store', $gitignore);
        $this->assertStringContainsString('.playwright-mcp/', $gitignore);
        $this->assertStringContainsString('database/database.sqlite', $gitignore);
        $this->assertStringContainsString('database/database.sqlite-journal', $gitignore);
        $this->assertStringContainsString('docs/superpowers/', $gitignore);
        $this->assertStringContainsString('*.log', $gitignore);

        $composer = json_decode((string) file_get_contents(base_path('composer.json')), true);
        $this->assertSame('relay/studio', $composer['name']);
        $this->assertSame('Apache-2.0', $composer['license']);
        $this->assertSame('Tactile, high-density engineering work tracking, real-time Kanban boards, and delivery analytics.', $composer['description']);
        $this->assertArrayNotHasKey('laravel/sail', $composer['require-dev'] ?? []);
        $this->assertArrayNotHasKey('laravel/breeze', $composer['require-dev'] ?? []);
    }

    /**
     * Test tooling and static analysis configuration files exist.
     */
    public function test_tooling_and_ci_configuration_files_exist(): void
    {
        $this->assertFileExists(base_path('.prettierrc'));
        $this->assertFileExists(base_path('eslint.config.js'));
        $this->assertFileExists(base_path('phpstan.neon'));
        $this->assertFileExists(base_path('.github/dependabot.yml'));

        $packageJson = json_decode((string) file_get_contents(base_path('package.json')), true);
        $this->assertArrayHasKey('lint', $packageJson['scripts']);
        $this->assertSame('eslint resources/js', $packageJson['scripts']['lint']);

        $dependabot = file_get_contents(base_path('.github/dependabot.yml'));
        $this->assertStringContainsString('package-ecosystem: "composer"', $dependabot);
        $this->assertStringContainsString('package-ecosystem: "npm"', $dependabot);
        $this->assertStringContainsString('package-ecosystem: "github-actions"', $dependabot);
    }
}
