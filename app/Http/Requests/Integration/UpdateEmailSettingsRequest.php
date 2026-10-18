<?php

declare(strict_types=1);

namespace App\Http\Requests\Integration;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateEmailSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('manage_workspace') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'sender_name' => ['required', 'string', 'max:100'],
            'accent_color' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'logo_url' => ['nullable', 'string', 'url', 'max:500'],
            'footer_note' => ['nullable', 'string', 'max:500'],
            'events' => ['nullable', 'array'],
            'events.ticket_created' => ['nullable', 'boolean'],
            'events.ticket_status' => ['nullable', 'boolean'],
            'events.ticket_assigned' => ['nullable', 'boolean'],
            'events.ticket_blocked' => ['nullable', 'boolean'],
            'events.ticket_comment' => ['nullable', 'boolean'],
        ];
    }
}
