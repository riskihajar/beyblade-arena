<?php

namespace App\Http\Requests\Admin\Stadium;

use App\Enums\StadiumStatusEnum;
use App\Models\Stadium;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStadiumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Stadium::class);
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'exists:events,id'],
            'name' => ['required', 'string', 'max:100'],
            'model_type' => ['required', 'string', 'max:100'],
            'assigned_judge_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', Rule::enum(StadiumStatusEnum::class)],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
