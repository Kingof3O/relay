<?php

declare(strict_types=1);

namespace App\Http\Requests\Integration;

use Illuminate\Foundation\Http\FormRequest;

final class TestEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('manage_workspace') ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'event' => ['nullable', 'string', 'in:created,assignment,status,review,done,reopened,blocked,comment'],
        ];
    }
}
