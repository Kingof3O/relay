<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;

final class SocialAuthService
{
    public const SUPPORTED_PROVIDERS = ['github', 'google'];

    /**
     * Determine whether an authentication provider is enabled.
     */
    public static function isEnabled(string $provider): bool
    {
        if (! in_array($provider, self::SUPPORTED_PROVIDERS, true)) {
            return false;
        }

        // 1. Dynamic cache/database override (set via admin settings or CLI)
        $override = Cache::get("auth.provider.{$provider}.enabled");
        if ($override !== null) {
            return (bool) $override;
        }

        // 2. Explicit .env / config flag (e.g. AUTH_GITHUB_ENABLED=false)
        $configured = config("services.{$provider}.enabled");
        if ($configured !== null && $configured !== '') {
            return filter_var($configured, FILTER_VALIDATE_BOOLEAN);
        }

        // 3. Testing environment defaults to true if not explicitly disabled
        if (app()->environment('testing')) {
            return true;
        }

        // 4. Default: enabled only if client_id credentials are configured
        $clientId = config("services.{$provider}.client_id");

        return ! empty($clientId);
    }

    /**
     * Programmatically enable or disable a provider at runtime.
     */
    public static function setEnabled(string $provider, bool $enabled): void
    {
        if (in_array($provider, self::SUPPORTED_PROVIDERS, true)) {
            Cache::forever("auth.provider.{$provider}.enabled", $enabled);
        }
    }

    /**
     * Clear any runtime override, restoring default .env/config behavior.
     */
    public static function clearOverride(string $provider): void
    {
        Cache::forget("auth.provider.{$provider}.enabled");
    }

    /**
     * Map of enabled providers for client UI rendering.
     *
     * @return array<string, bool>
     */
    public static function enabledProviders(): array
    {
        return [
            'github' => self::isEnabled('github'),
            'google' => self::isEnabled('google'),
        ];
    }

    /**
     * Detailed status of all OAuth providers for admin inspection.
     *
     * @return array<string, array{enabled: bool, configured: bool, has_override: bool, client_id: ?string}>
     */
    public static function providersStatus(): array
    {
        $status = [];

        foreach (self::SUPPORTED_PROVIDERS as $provider) {
            $clientId = config("services.{$provider}.client_id");
            $maskedId = ! empty($clientId)
                ? substr((string) $clientId, 0, min(6, strlen((string) $clientId))).'••••'
                : null;

            $status[$provider] = [
                'enabled' => self::isEnabled($provider),
                'configured' => ! empty($clientId),
                'has_override' => Cache::has("auth.provider.{$provider}.enabled"),
                'client_id' => $maskedId,
            ];
        }

        return $status;
    }
}
