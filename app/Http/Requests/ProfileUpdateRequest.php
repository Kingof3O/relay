<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => [
                'sometimes',
                'required',
                'string',
                'lowercase',
                'alpha_dash:ascii',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'notification_preferences' => ['sometimes', 'nullable', 'array'],
            'notification_preferences.email_on_assignment' => ['sometimes', 'boolean'],
            'notification_preferences.email_on_status_change' => ['sometimes', 'boolean'],
            'notification_preferences.email_on_comment' => ['sometimes', 'boolean'],
        ];
    }
}
