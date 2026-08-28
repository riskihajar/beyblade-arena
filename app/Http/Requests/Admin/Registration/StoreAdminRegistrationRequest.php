<?php

namespace App\Http\Requests\Admin\Registration;

use App\Enums\RegistrationStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdminRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Registration::class);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:tournament_categories,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'email' => ['required_without:user_id', 'nullable', 'email', 'max:255'],
            'display_nickname' => ['required', 'string', 'max:100'],
            'seed_number' => ['nullable', 'integer', 'min:1', 'max:512'],
            'status' => ['required', Rule::enum(RegistrationStatusEnum::class)],
            'deck_data' => ['nullable', 'array'],
            'is_deck_locked' => ['boolean'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:50'],
            'guardian_relationship' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
