<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\DiscordNotificationService;
use Illuminate\Console\Command;

final class RelayDiscordTestCommand extends Command
{
    /** @var string */
    protected $signature = 'relay:discord-test {webhook_url? : Optional Discord Webhook URL to test}';

    /** @var string */
    protected $description = 'Send a test notification embed to Discord to verify webhook integration';

    public function handle(): int
    {
        $this->info('╔════════════════════════════════════════════════════════════════╗');
        $this->info('║             RELAY STUDIO · DISCORD INTEGRATION TEST            ║');
        $this->info('╚════════════════════════════════════════════════════════════════╝');

        $url = $this->argument('webhook_url') ?: DiscordNotificationService::getWebhookUrl();

        if (blank($url)) {
            $this->error('Error: No Discord Webhook URL configured.');
            $this->line('Provide one as an argument: php artisan relay:discord-test https://discord.com/api/webhooks/...');
            $this->line('Or configure DISCORD_WEBHOOK_URL in your .env file or Studio Settings.');

            return self::FAILURE;
        }

        $masked = substr((string) $url, 0, 32).'••••'.substr((string) $url, -6);
        $this->line("Target Webhook: <fg=cyan>{$masked}</>");
        $this->line('Sending test embed payload...');

        $result = DiscordNotificationService::ping((string) $url);

        if ($result['success']) {
            $this->info('✔ Success: '.$result['message']);
            $this->line('Check your Discord channel to confirm the embed was delivered.');

            return self::SUCCESS;
        }

        $this->error('✖ Delivery Failed: '.$result['message']);

        return self::FAILURE;
    }
}
