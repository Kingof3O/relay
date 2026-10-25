<?php

declare(strict_types=1);

namespace App\Http\Requests\Integration;

use App\Services\DiscordNotificationService;
use App\Support\UrlSecurity;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateDiscordSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('manage_workspace') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'enabled' => ['required', 'boolean'],
            'webhook_url' => [
                'nullable',
                'string',
                'max:2000',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! empty($value)) {
                        $urls = DiscordNotificationService::parseUrls((string) $value);
                        foreach ($urls as $u) {
                            if (! UrlSecurity::isSafeDiscordWebhookUrl($u)) {
                                $fail('The webhook URL must be a valid, public Discord webhook URL (https://discord.com/api/webhooks/...).');

                                return;
                            }
                        }
                    }
                },
            ],
            'webhook_urls' => ['nullable', 'array'],
            'webhook_urls.*' => [
                'required',
                'string',
                'url',
                'max:500',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! empty($value) && ! UrlSecurity::isSafeDiscordWebhookUrl((string) $value)) {
                        $fail('Each webhook URL must be a valid, public Discord webhook URL (https://discord.com/api/webhooks/...).');
                    }
                },
            ],
            'bot_name' => ['nullable', 'string', 'max:100'],
            'avatar_url' => ['nullable', 'string', 'url', 'max:500'],
            'events' => ['nullable', 'array'],
            'events.ticket_created' => ['nullable', 'boolean'],
            'events.ticket_status' => ['nullable', 'boolean'],
            'events.ticket_assigned' => ['nullable', 'boolean'],
            'events.ticket_blocked' => ['nullable', 'boolean'],
            'events.ticket_comment' => ['nullable', 'boolean'],
        ];
    }
}
