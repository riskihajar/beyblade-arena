<?php

namespace App\Http\Requests\Admin\Stadium;

use App\Enums\StadiumStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStadiumRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('stadium'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'model_type' => ['required', 'string', 'max:100'],
            'assigned_judge_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', Rule::enum(StadiumStatusEnum::class)],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
