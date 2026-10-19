<?php

declare(strict_types=1);

namespace App\Http\Requests\Integration;

use App\Support\UrlSecurity;
use Illuminate\Foundation\Http\FormRequest;

final class TestDiscordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('manage_workspace') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'webhook_url' => [
                'nullable',
                'string',
                'url',
                'max:500',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    if (! empty($value) && ! UrlSecurity::isSafeDiscordWebhookUrl((string) $value)) {
                        $fail('The webhook URL must be a valid, public Discord webhook URL (https://discord.com/api/webhooks/...).');
                    }
                },
            ],
        ];
    }
}
