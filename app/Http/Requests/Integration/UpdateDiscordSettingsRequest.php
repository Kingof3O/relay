<?php

declare(strict_types=1);

namespace App\Http\Requests\Integration;

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
            'webhook_url' => ['nullable', 'string', 'url', 'max:500'],
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
