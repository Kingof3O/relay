<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\SocialAuthService;
use Illuminate\Console\Command;

final class RelayOAuthCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'relay:oauth
                            {provider? : The OAuth provider to manage (github or google)}
                            {--enable : Enable the provider for user login}
                            {--disable : Disable the provider for user login}
                            {--reset : Clear any runtime override and revert to .env/config}
                            {--status : Display current OAuth providers status table}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Inspect and toggle OAuth social authentication providers (GitHub, Google)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $provider = $this->argument('provider');

        if (! $provider || $this->option('status')) {
            $this->displayStatusTable();

            return self::SUCCESS;
        }

        $provider = strtolower((string) $provider);

        if (! in_array($provider, SocialAuthService::SUPPORTED_PROVIDERS, true)) {
            $this->error("Unsupported provider [{$provider}]. Supported: ".implode(', ', SocialAuthService::SUPPORTED_PROVIDERS));

            return self::FAILURE;
        }

        if ($this->option('enable')) {
            SocialAuthService::setEnabled($provider, true);
            $this->info("✔ [{$provider}] OAuth login has been ENABLED. The button will appear on the login page.");
        } elseif ($this->option('disable')) {
            SocialAuthService::setEnabled($provider, false);
            $this->warn("✖ [{$provider}] OAuth login has been DISABLED. The button is now hidden from the login page.");
        } elseif ($this->option('reset')) {
            SocialAuthService::clearOverride($provider);
            $this->info("⟳ [{$provider}] OAuth override cleared. Reverted to .env / config default.");
        } else {
            $status = SocialAuthService::isEnabled($provider) ? 'ENABLED' : 'DISABLED';
            $this->line("Provider [{$provider}] is currently: <fg=".($status === 'ENABLED' ? 'green' : 'red').">{$status}</>");
            $this->line('Use --enable or --disable to change this setting.');
        }

        return self::SUCCESS;
    }

    private function displayStatusTable(): void
    {
        $this->components->info('Relay Studio OAuth Social Authentication Providers');

        $statuses = SocialAuthService::providersStatus();
        $rows = [];

        foreach ($statuses as $name => $info) {
            $statusBadge = $info['enabled'] ? '<fg=green>✔ Enabled</>' : '<fg=red>✖ Disabled</>';
            $configBadge = $info['configured'] ? '<fg=green>Configured</>' : '<fg=yellow>Missing Credentials</>';
            $overrideBadge = $info['has_override'] ? '<fg=cyan>Manual Override</>' : '<fg=gray>Default Config</>';

            $rows[] = [
                ucfirst($name),
                $statusBadge,
                $configBadge,
                $overrideBadge,
                $info['client_id'] ?? '<fg=gray>None</>',
            ];
        }

        $this->table(
            ['Provider', 'Login Status', 'Credentials (.env)', 'Source', 'Client ID'],
            $rows
        );
    }
}
