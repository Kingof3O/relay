<?php

declare(strict_types=1);

namespace App\Http\Requests\WorkRequest;

use App\Enums\RequestPriority;
use App\Enums\RequestStatus;
use App\Models\WorkRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateWorkRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        $request = $this->route('request');

        if (! $request instanceof WorkRequest) {
            return false;
        }

        if ($this->has('status') && ! $this->user()?->can('changeStatus', $request)) {
            return false;
        }

        if ($this->has('assignee_id') && ! $this->user()?->can('assign', $request)) {
            return false;
        }

        $editableKeys = ['title', 'description', 'area_id', 'priority', 'is_blocked', 'blocked_reason', 'due_date', 'tags'];
        $hasEditableFields = collect($this->keys())->intersect($editableKeys)->isNotEmpty();

        if ($hasEditableFields && ! $this->user()?->can('update', $request)) {
            return false;
        }

        return $this->user()?->can('view', $request) ?? false;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'area_id' => ['sometimes', 'required', 'integer', Rule::exists('areas', 'id')->where(fn ($query) => $query->whereNull('archived_at'))],
            'priority' => ['sometimes', Rule::in(array_keys(RequestPriority::options()))],
            'status' => ['sometimes', Rule::in(array_keys(RequestStatus::options()))],
            'assignee_id' => ['sometimes', 'nullable', 'integer', Rule::exists('users', 'id')->where(fn ($query) => $query->where('active', true))],
            'is_blocked' => ['sometimes', 'boolean'],
            'blocked_reason' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'tags' => ['sometimes', 'nullable', 'array'],
            'tags.*' => ['string', 'max:30'],
            'files' => ['sometimes', 'nullable', 'array'],
            'files.*' => ['file', 'max:65536'],
            'file' => ['sometimes', 'nullable', 'file', 'max:65536'],
        ];
    }
}
