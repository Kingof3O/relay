<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

final class RelayTokenCommand extends Command
{
    protected $signature = 'relay:token {username? : The username or email of the user} {name=mcp-agent : Token name}';

    protected $description = 'Generate a personal access token for Relay Studio API and MCP Server';

    public function handle(): int
    {
        $identifier = $this->argument('username');

        $user = null;
        if ($identifier) {
            $user = User::query()
                ->where('username', $identifier)
                ->orWhere('email', $identifier)
                ->first();
        } else {
            $user = User::query()->where('active', true)->first();
        }

        if (! $user) {
            $this->error('User not found. Please provide a valid username or email.');

            return self::FAILURE;
        }

        $tokenName = (string) $this->argument('name');
        $token = $user->createToken($tokenName, ['*'])->plainTextToken;

        $this->info("Personal Access Token created successfully for @{$user->username} ({$user->name}):");
        $this->line('');
        $this->warn("  {$token}");
        $this->line('');
        $this->comment('Add this token as RELAY_API_TOKEN in your MCP client configuration.');

        return self::SUCCESS;
    }
}
