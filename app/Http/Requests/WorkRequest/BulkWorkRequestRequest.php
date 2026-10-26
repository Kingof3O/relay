<?php

declare(strict_types=1);

namespace App\Http\Requests\WorkRequest;

use App\Enums\RequestPriority;
use App\Models\WorkRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class BulkWorkRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', WorkRequest::class) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'requests' => ['required', 'array', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'requests.required' => 'Add at least one request row.',
            'requests.array' => 'Add at least one request row.',
            'requests.min' => 'Add at least one request row.',
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function rowRules(?int $workspaceId = null): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'area_id' => [
                'required',
                'integer',
                Rule::exists('areas', 'id')->where(fn ($query) => $workspaceId ? $query->where('workspace_id', $workspaceId)->whereNull('archived_at') : $query->whereNull('archived_at')),
            ],
            'priority' => ['required', Rule::in(array_keys(RequestPriority::options()))],
            'cycle_id' => [
                'nullable',
                'integer',
                Rule::exists('cycles', 'id')->where(fn ($query) => $workspaceId ? $query->where('workspace_id', $workspaceId) : $query),
            ],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('requests', 'id')->where(fn ($query) => $workspaceId ? $query->where('workspace_id', $workspaceId) : $query),
            ],
            'assignee_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $workspaceId ? $query->whereIn('id', fn ($sub) => $sub->select('user_id')->from('workspace_user')->where('workspace_id', $workspaceId))->where('active', true) : $query->where('active', true)),
            ],
        ];
    }
}
